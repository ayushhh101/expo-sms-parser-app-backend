const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple in-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Send OTP (dummy for development)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found with this phone number'
      });
    }

    // Generate dummy OTP (always 1234 for demo)
    const otp = '1234';
    
    // Store OTP with 5 minute expiry
    otpStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      userId: user.userId
    });

    console.log(`OTP for ${phone}: ${otp}`); // Log for testing

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
      // In production, never send OTP in response
      otp: otp // Only for demo purposes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify OTP and Login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    // Check if OTP exists and is valid
    const storedData = otpStore.get(phone);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired'
      });
    }

    if (storedData.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        error: 'OTP expired'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Get user data
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(phone);

    // Return user session data
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        city: user.city,
        preferred_language: user.preferred_language,
        permissions: user.permissions,
        work_profile: user.work_profile
      },
      // Simple token (use JWT in production)
      token: `simple_token_${user.userId}_${Date.now()}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile (requires simple auth)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('simple_token_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing token'
      });
    }

    // Extract userId from simple token
    const userId = token.split('_')[2];
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        city: user.city,
        age: user.age,
        preferred_language: user.preferred_language,
        permissions: user.permissions,
        work_profile: user.work_profile,
        financial_profile: user.financial_profile,
        ai_context: user.ai_context,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;