import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        console.log("🔍 Fetching ticket:", ticketId);
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        console.log("✅ Ticket fetched:", ticketObject.title);
        return ticketObject;
      });

      // Update ticket status to TODO
      await step.run("update-ticket-status", async () => {
        console.log("📝 Updating ticket status to TODO");
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
        return true;
      });

      // AI Processing
      const aiResponse = await step.run("ai-processing", async () => {
        console.log("🤖 Starting AI analysis...");
        const response = await analyzeTicket(ticket);
        
        if (response) {
          console.log("✅ AI analysis complete:", response);
          
          // Validate priority
          const validPriority = ["low", "medium", "high"].includes(response.priority)
            ? response.priority
            : "medium";

          // Update ticket with AI response
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: validPriority,
            helpfulNotes: response.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: response.relatedSkills || [],
          });
          
          console.log("✅ Ticket updated with AI response");
          return response.relatedSkills || [];
        }
        
        console.log("⚠️ No AI response received");
        return [];
      });

      // Assign moderator
      const moderator = await step.run("assign-moderator", async () => {
        console.log("👤 Finding suitable moderator...");
        
        let user = null;
        
        // Try to find moderator with matching skills
        if (aiResponse && aiResponse.length > 0) {
          user = await User.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: aiResponse.join("|"),
                $options: "i",
              },
            },
          });
        }
        
        // Fallback to any moderator
        if (!user) {
          user = await User.findOne({ role: "moderator" });
        }
        
        // Fallback to admin
        if (!user) {
          console.log("⚠️ No moderator found, assigning to admin");
          user = await User.findOne({ role: "admin" });
        }
        
        // Update ticket with assigned user
        if (user) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            assignedTo: user._id,
          });
          console.log("✅ Ticket assigned to:", user.email);
        } else {
          console.log("⚠️ No moderator or admin found");
        }
        
        return user;
      });

      // Send email notification
      await step.run("send-email-notification", async () => {
        if (moderator) {
          console.log("📧 Sending email to:", moderator.email);
          const finalTicket = await Ticket.findById(ticket._id);
          
          try {
            await sendMail(
              moderator.email,
              "New Ticket Assigned",
              `A new ticket has been assigned to you: ${finalTicket.title}`
            );
            console.log("✅ Email sent successfully");
          } catch (emailError) {
            console.error("⚠️ Email sending failed (non-critical):", emailError.message);
          }
        } else {
          console.log("⚠️ No moderator to send email to");
        }
        return true;
      });

      console.log("🎉 Ticket processing complete!");
      return { success: true };
      
    } catch (err) {
      console.error("❌ Error in ticket processing:", err.message);
      console.error(err);
      return { success: false, error: err.message };
    }
  }
);