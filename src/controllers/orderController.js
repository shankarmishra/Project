import Order from '../models/orderModels.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import crypto from 'crypto';
import Transaction from '../models/transactionModels.js';
import Razorpay from 'razorpay';

// Create Razorpay Transaction (Order)
const createTransaction = asyncHandler(async (req, res) => {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
        console.error("❌ Missing amount or userId");
        return res.status(400).json({ success: false, message: "Amount and User ID are required" });
    }

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_PAY_SECRET || '',
    });

    // Verify that API credentials are set correctly
    if (!razorpay.key_id || !razorpay.key_secret) {
        console.error("❌ Razorpay API credentials missing");
        return res.status(500).json({ success: false, message: "Razorpay API credentials are missing" });
    }

    const options = {
        amount: amount * 100,  // Convert to paise
        currency: "INR",
        receipt: `receipt#${Date.now()}`,
    };

    try {
        console.log("🔵 Creating Razorpay Order with options:", options);
        const razorpayOrder = await razorpay.orders.create(options);
        console.log("✅ Razorpay Order Created:", razorpayOrder);

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            key: process.env.RAZORPAY_KEY_ID || '',
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
        });
    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
});

// Create an Order after Payment Verification
const createOrder = asyncHandler(async (req, res) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId,
        cartItems,
        deliveryDate,
        address,
    } = req.body;

    // Ensure all required fields are provided
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !userId || !cartItems.length || !address) {
        console.error("❌ Missing required fields in createOrder");
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("🔵 Verifying Payment Signature...");
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_PAY_SECRET || 'BHLYjYUlyJtQOQmUviYQM7K9')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (generatedSignature !== razorpaySignature) {
        console.error("❌ Invalid payment signature");
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    console.log("✅ Payment Signature Verified");

    // Calculate Total Amount
    const totalAmount = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

    try {
        // Set delivery date to 3 days from now if it's not passed in the request
        const finalDeliveryDate = deliveryDate || new Date(new Date().setDate(new Date().getDate() + 3));

        // Creating the Order Record first
        console.log("🔵 Creating Order Record...");
        const newOrder = await Order.create({
            user: userId,
            address,
            deliveryDate: finalDeliveryDate,
            items: cartItems.map(item => ({
                product: new mongoose.Types.ObjectId(item.product),
                quantity: item.quantity,
            })),
            status: "Order Placed",
        });

        console.log("✅ Order Created:", newOrder);

        // Now, create the Transaction Record
        console.log("🔵 Creating Transaction Record...");
        const transaction = await Transaction.create({
            userId: userId,
            order: newOrder._id,
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            status: "completed",
            totalAmount: totalAmount,
            address: address,
        });

        console.log("✅ Transaction Created:", transaction);

        res.json({
            success: true,
            message: "Payment verified and order created successfully",
            order: newOrder,
        });
    } catch (error) {
        console.error("❌ Error in createOrder:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create transaction or order",
            error: error.message,
        });
    }
});

// Get Orders by User ID
const getOrderbyUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error("❌ Invalid or missing User ID in getOrderbyUserId");
        return res.status(400).json({ success: false, message: "Valid User ID is required" });
    }

    try {
        console.log(`🔵 Fetching orders for userId: ${userId}`);
        const orders = await Order.find({ user: userId })
            .populate({
                path: "user",
                select: "name email",
                model: "User"
            })
            .populate({
                path: "items.product",
                select: "name price image_uri ar_uri",
                model: "Product"
            })
            .sort({ createdAt: -1 });

        console.log("✅ Orders Retrieved:", orders.length);
        res.status(200).json({ 
            success: true, 
            orders: orders || [] 
        });
    } catch (error) {
        console.error("❌ Error in getOrderbyUserId:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get orders",
            error: error.message,
        });
    }
});

// Export controllers
export { createTransaction, createOrder, getOrderbyUserId };
