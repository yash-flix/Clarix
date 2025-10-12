import {inngest} from "../client.js"
import Ticket from "../../models/ticket.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utilis/mailer.js";
import { analyzeTicket } from "../../utilis/ai.js";
import User from "../../models/user.js"


export const onTicketCreated = inngest.createFunction(
   {id:"on-ticket-created" , retries:2},
    {event:"ticket/created"},
    async ({event , step}) =>
    {
        try {
            const {ticketId} = event.data;
           const ticket =  await step.run("fetch-ticket" , async()=>
            {
                  const ticketObject= await Ticket.findById(ticketId);
           if(!ticketObject)
           {
            throw new NonRetriableError("Ticket no longer exits in the databse")
           }
           return ticketObject;
            })
            await step.run("update-ticket-status" , async()=>
            {
                await Ticket.findByIdAndUpdate(ticketId._id , {status:"TODO"})
            })
          const aiResponse = await analyzeTicket(ticket);

          const relatedSkills = await step.run("ai-processing", async()=>
        {
            let skills = [];
            if(aiResponse)
            {
                await Ticket.findByIdAndUpdate(ticketId._id ,{
                    priority: !["low" , ",medium" , "high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                    helpfullNotes: aiResponse.helpfullNotes,
                    status:"IN-PROGRESS",
                    relatedSkills:aiResponse.relatedSkills || [] , 
                } )
                skills = aiRespomse.relatedSkills || [];
            }
            return skills;
        })
        const moderator = await step.run("assign-moderator" , async()=>
        {
            const user = await User.findOne({
                role:"moderator",
                skills : {
                    $elemMatch: { 
                        $regex : relatedSkills.join("|") , $options:"i"
                     }
                }
            });
            if(!user)
            {
                user = await User.findOne({role:"admin"})
            }

            await Ticket.findByIdAndUpdate(ticketId._id , {assignedTo:user?._id || null })
            return user;
        });
        await step.run("send-email-notification" , async()=>{
            if(moderator)
            {
                 const finalTicket = await Ticket.findById(ticket._id);
                await sendMail( moderator.email,
                    "New Ticket Assigned",
                    `A new ticket titled "${finalTicket.title}" has been assigned to you. Please review and take the necessary actions.`
                )
            }

        })
        return {success:true};

        } catch (error) {
            console.error("Error in onTicketCreated function:", error.message);
            return {success:false}
            
        }
    }
)