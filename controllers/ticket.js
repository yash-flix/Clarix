import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

/**
 * Create a new ticket
 */
export const createTicket = async (req, res) => {
  try {
    console.log('📝 Creating ticket...');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { title, description } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        message: "Title and description are required" 
      });
    }
    
    if (title.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 5 characters long"
      });
    }
    
    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 10 characters long"
      });
    }
    
    // Create ticket
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,  // ✅ No need for .toString() here
      status: "OPEN"
    });
    
    console.log('✅ Ticket created:', newTicket._id);
    
    // Trigger Inngest event (non-blocking)
    setImmediate(async () => {
      try {
        console.log('🚀 Sending Inngest event...');
        
        await inngest.send({
          name: "ticket/created",
          data: {
            ticketId: newTicket._id.toString(),  // ✅ Fixed: removed redundant await
            title: newTicket.title,
            description: newTicket.description,
            createdBy: req.user._id.toString()
          }
        });
        
        console.log('✅ Inngest event sent');
      } catch (inngestError) {
        console.error('⚠️ Inngest event failed:', inngestError.message);
      }
    });
    
    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: newTicket
    });
    
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating ticket",
      error: error.message
    });
  }
};

/**
 * Get all tickets (filtered by user role)
 */
export const getTickets = async (req, res) => {
  try {
    console.log('📋 Fetching tickets for user:', req.user.email);
    
    const user = req.user;
    let tickets = [];
    
    if (user.role !== "user") {
      // Moderator or Admin: see all tickets
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id", "username"])
        .populate("createdBy", ["email", "_id", "username"])
        .sort({ createdAt: -1 });  // ✅ Fixed: proper chaining
      
      console.log(`✅ Found ${tickets.length} tickets (all)`);
    } else {
      // Regular user: only their tickets
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status priority createdAt")
        .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${tickets.length} tickets (user's own)`);
    }
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
    
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching tickets",
      error: error.message
    });
  }
};

/**
 * Get single ticket by ID
 */
export const getTicket = async (req, res) => {
  try {
    console.log('🔍 Fetching ticket:', req.params.id);
    
    const user = req.user;
    let ticket;
    
    if (user.role !== "user") {
      // Moderator or Admin: can see any ticket
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "_id", "username"])
        .populate("createdBy", ["email", "_id", "username"]);
      
    } else {
      // Regular user: only their own tickets
      ticket = await Ticket.findOne({  // ✅ Fixed: added dot
        createdBy: user._id,
        _id: req.params.id
      }).select("title description status priority createdAt helpfulNotes");
    }
    
    if (!ticket) {
      console.log('❌ Ticket not found');
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }
    
    console.log('✅ Ticket found:', ticket._id);
    
    return res.status(200).json({
      success: true,
      ticket
    });
    
  } catch (error) {
    console.error("❌ Error fetching ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching ticket",
      error: error.message
    });
  }
};

/**
 * Update ticket status (for moderators/admins)
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const validStatuses = ["OPEN", "TODO", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }
    
    res.json({
      success: true,
      message: "Ticket status updated",
      ticket
    });
    
  } catch (error) {
    console.error("❌ Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating ticket",
      error: error.message
    });
  }
};