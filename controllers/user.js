import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

/**
 * User Signup
 */
export const signup = async (req, res) => {
  try {
    console.log('📥 Signup request received');
    console.log('Request body:', req.body);
    
    const { email, password, username, skills = [] } = req.body;
    

    // VALIDATION
   
    if (!email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({ 
        error: "Invalid email format" 
      });
    }
    
    // Password validation
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ 
        error: "Password must be at least 6 characters" 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        error: "User already exists with this email" 
      });
    }
    
    console.log('✅ Validation passed');
    

    // CREATE USER
  
    console.log('🔒 Hashing password...');
    const hashed = await bcrypt.hash(password, 10);
    
    console.log('💾 Creating user in database...');
    const user = await User.create({
      email: email.toLowerCase(),
      username: username || email.split('@')[0], // Use email prefix if no username
      password: hashed,
      skills: Array.isArray(skills) ? skills : [],
      role: 'user' // Default role
    });
    
    console.log('✅ User created:', user.email);
   
    // TRIGGER INNGEST EVENT (NON-BLOCKING)
    
    setImmediate(async () => {
      try {
        console.log('🚀 Sending Inngest event...');
        await inngest.send({
          name: "user/signup",
          data: {
            email: user.email,
            username: user.username || user.email,
            userId: user._id.toString()
          }
        });
        console.log('✅ Inngest event sent successfully');
      } catch (inngestError) {
        console.error('⚠️ Inngest event failed (non-critical):', inngestError.message);
      }
    });
    
   
    // GENERATE JWT TOKEN
  
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
  
    // SEND RESPONSE (WITHOUT PASSWORD)
  
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      skills: user.skills
    };
    
    console.log('🎉 Signup successful for:', user.email);
    
    res.status(201).json({ 
      user: userResponse, 
      token 
    });
    
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      error: "Signup failed", 
      details: error.message 
    });
  }
};

/**
 * User Login
 */
export const login = async (req, res) => {
  try {
    console.log('📥 Login request received');
    
    const { email, password } = req.body;
  
    // VALIDATION

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }
    

    // FIND USER

    console.log('🔍 Looking up user:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }
    

    // VERIFY PASSWORD
  
    console.log('🔐 Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }
    
    console.log('✅ Password verified');
    

    // UPDATE LAST LOGIN

    user.lastLogin = new Date();
    await user.save();
    

    // GENERATE JWT TOKEN

    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { 
        _id: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
  
    // SEND RESPONSE (WITHOUT PASSWORD)

    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      skills: user.skills
    };
    
    console.log('🎉 Login successful for:', user.email);
    
    res.json({ 
      user: userResponse, 
      token 
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: "Login failed", 
      details: error.message 
    });
  }
};

/**
 * User Logout
 
 */
export const logout = async (req, res) => {
  try {
   
    console.log('👋 Logout request');
    res.json({ 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      error: "Logout failed", 
      details: error.message 
    });
  }
};

/**
 * Update User (Admin Only)
 */
export const updateUser = async (req, res) => {
  try {
    console.log('🔧 Update user request');
    
    const { skills = [], role, email } = req.body;
    
   
    // AUTHORIZATION CHECK
 
    if (req.user?.role !== "admin") {
      console.log('❌ Forbidden: User is not admin');
      return res.status(403).json({ 
        error: "Forbidden: Admin access required" 
      });
    }
    
  
    // VALIDATION
  
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required" 
      });
    }
    
    
    // FIND USER
   
    console.log('🔍 Finding user:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        error: "User not found" 
      });
    }
    
   
    // VALIDATE ROLE
    
    const validRoles = ['user', 'moderator', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }
    
    
    // UPDATE USER
   
    console.log('💾 Updating user...');
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        skills: skills.length ? skills : user.skills,
        role: role || user.role
      },
      { new: true }
    ).select('-password');
    
    console.log('✅ User updated successfully');
    
    return res.json({
      message: "User updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ 
      error: "Update failed", 
      details: error.message 
    });
  }
};

/**
 * Get All Users (Admin Only)
 */
export const getUsers = async (req, res) => {
  try {
    console.log('👥 Get users request');
    
    
    // AUTHORIZATION CHECK
  
    if (req.user?.role !== "admin") {
      console.log('❌ Forbidden: User is not admin');
      return res.status(403).json({ 
        error: "Forbidden: Admin access required" 
      });
    }
    

    // FETCH USERS

    console.log('📋 Fetching all users...');
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    return res.json({
      count: users.length,
      users
    });
    
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ 
      error: "Failed to fetch users", 
      details: error.message 
    });
  }
};