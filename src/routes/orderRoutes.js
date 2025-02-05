import express from 'express';
import { createTransaction, createOrder, getOrderbyUserId } from '../controllers/orderController.js';

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Create a transaction
router.post('/transaction', asyncHandler(createTransaction));

// Get orders by user ID
router.get('/:userId', asyncHandler(getOrderbyUserId));

// Create an order
router.post('/', asyncHandler(createOrder));

// Global error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default router;
