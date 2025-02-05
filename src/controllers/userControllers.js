import User from '../models/userModels.js'; // Import the User model
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate token
const generateToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '20d',
    });

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
    });

    return { accessToken, refreshToken };
};

// Register a new user
const register = async (req, res) => {
    const { phone, email, password, address } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user if not found
        user = new User({
            phone,
            email,
            password: hashedPassword,
            address,
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // Send tokens in the response
        res.status(201).json({ 
            message: 'User registered successfully', 
            token: accessToken, // Changed to match localStorage key
            refreshToken 
        });
    } catch (error) {
        console.log('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please register first.' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // Send tokens in the response
        res.status(200).json({ 
            user,
            token: accessToken, // Changed to match localStorage key
            refreshToken 
        });
    } catch (error) {
        console.log('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

// Home page (dashboard) route
const home = (req, res) => {
    res.render('home'); // Rendering the home page
};

// Logout user
const logout = (req, res) => {
    // No need to clear cookies since using localStorage
    res.status(200).json({ message: 'Logged out successfully' });
};

// Get user profile (details)
const getProfile = async (req, res) => {
    try {
        // Fetch user details using the user ID from the token
        const user = await User.findById(req.user.id); // Exclude password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user }); // Send user details
    } catch (error) {
        console.log('Error occurred:', error);
        res.status(500).json({ error: error.message });
    }
};

export { register, login, home, logout, getProfile };
