// authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import your User model

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    console.log('Headers:', req.headers);
    
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Check if the header has the Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format. Expected: Bearer <token>');
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', token);
    
    if (!token) {
      console.log('No token found after Bearer prefix');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    // Get the full user object from database
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      console.log('User not found with ID:', decoded._id);
      return res.status(401).json({ error: 'User not found.' });
    }
    
    // Attach the user to the request
    req.user = user;
    console.log('User attached to request:', user._id);
    
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

export default authMiddleware;