import express from "express";
import { 
  createTicket, 
  getTickets, 
  getTicket,
  updateTicketStatus 
} from "../controllers/ticket.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.patch("/:id/status", authenticate, updateTicketStatus);

export default router;