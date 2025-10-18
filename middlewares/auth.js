import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Authenticating request...');
    
    // ====================================
    // CHECK AUTHORIZATION HEADER
    // ====================================
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        error: "Access denied. No token provided" 
      });
    }
    
    // ====================================
    // EXTRACT TOKEN
    // ====================================
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.log('❌ Token is empty');
      return res.status(401).json({ 
        error: "Access denied. Invalid token format" 
      });
    }
    
    // ====================================
    // VERIFY TOKEN
    // ====================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.email);
    
    // ====================================
    // FETCH FULL USER DATA (OPTIONAL)
    // ====================================
    // You can optionally fetch the full user from database
    // This ensures the user still exists and gets fresh data
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        error: "User no longer exists" 
      });
    }
    
    // Attach user to request
    req.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      skills: user.skills
    };
    
    console.log('✅ Authentication successful');
    next();
    
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expired" 
      });
    }
    
    return res.status(401).json({ 
      error: "Authentication failed" 
    });
  }
};

/**
 * Authorization Middleware - Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    console.log('❌ User is not admin:', req.user?.email);
    return res.status(403).json({ 
      error: "Forbidden: Admin access required" 
    });
  }
  console.log('✅ Admin access verified');
  next();
};

/**
 * Authorization Middleware - Check if user is moderator or admin
 */
export const isModeratorOrAdmin = (req, res, next) => {
  if (req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
    console.log('❌ User is not moderator/admin:', req.user?.email);
    return res.status(403).json({ 
      error: "Forbidden: Moderator or Admin access required" 
    });
  }
  console.log('✅ Moderator/Admin access verified');
  next();
};