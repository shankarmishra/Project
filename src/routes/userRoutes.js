import express from 'express';
import { register, login, getProfile } from '../controllers/userControllers.js';  // Import the controller functions
import verifyToken from '../Middleware/userMiddleware.js';  // Import the JWT verification middleware

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Profile route to get the logged-in user's details
router.get('/profile', verifyToken, getProfile); // Apply the verifyToken middleware to protect this route

export default router;
