import {inngest} from "../client"
import Ticket from "../../models/ticket.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utilis/mailer";
import { analyzeTicket } from "../../utilis/ai.js";
import User from "../../models/user.js"


export const onTicketCreated = inggest.createFunction(
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

        })

        } catch (error) {
            
        }
    }
)