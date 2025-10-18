import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      console.log('🎯 Inngest function triggered: on-user-signup');
      console.log('📧 Event data:', event.data);
      
      const { email } = event.data;
      
      // ====================================
      // STEP 1: GET USER FROM DATABASE
      // ====================================
      const user = await step.run("get-user-email", async () => {
        console.log('🔍 Looking up user:', email);
        
        const userObject = await User.findOne({ email });
        
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in the database");
        }
        
        console.log('✅ User found:', userObject.email);
        return userObject;
      });
      
      // ====================================
      // STEP 2: SEND WELCOME EMAIL
      // ====================================
      await step.run("send-welcome-email", async () => {
        console.log('📮 Sending welcome email to:', user.email);
        
        const subject = `Welcome to Clarix!`;
        const message = `Hi ${user.username || user.email},\n\nThanks for signing up for Clarix! We're glad to have you onboard.\n\nYou can now create support tickets and our AI will help route them to the right team members.\n\nBest regards,\nThe Clarix Team`;
        
        await sendMail(user.email, subject, message);
        
        console.log('✅ Welcome email sent successfully');
      });
      
      console.log('🎉 Signup workflow completed successfully');
      return { success: true };  // ✅ Fixed typo: was "succes"
      
    } catch (error) {
      console.error("❌ Error running step:", error.message);
      return { success: false, error: error.message };  // ✅ Fixed typo
    }
  }
);