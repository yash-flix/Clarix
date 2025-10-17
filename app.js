import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import {serve} from "inngest/express"
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import {inngest} from "./inngest/client.js"
import {onUserSignup} from "./inngest/functions/on-signup.js"
import {onTicketCreated} from "./inngest/functions/on-ticket-create.js"

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

console.log("Mongo URI:", process.env.MONGO_URI); 

app.use("/api/auth" , userRoutes)
app.use("/api/tickets" , ticketRoutes);
app.use("/api/inngest" ,serve({
  client:inngest ,
  functions:[onUserSignup , onTicketCreated]
}) )



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb error:", err);
  });
