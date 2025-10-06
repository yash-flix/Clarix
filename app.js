import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

console.log("Mongo URI:", process.env.MONGO_URI); 

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
