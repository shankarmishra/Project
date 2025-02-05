import mongoose from 'mongoose';

const { Schema } = mongoose;

const ItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  // Correctly references Product model
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const orderSchema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deliveryDate: { 
        type: Date,
        // Optional field for delivery date
    },
    address: { 
        type: String,
        required: true,
    },
    items: {
        type: [ItemSchema],
        required: true,
    },
    status: { 
        type: String,
        enum: [
            "Order Placed",
            "Shipping",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ],
        required: true,
        default: 'Order Placed',
    },
    createdAt: { 
        type: Date,
        default: Date.now,
    },
    updatedAt: { 
        type: Date,
        default: Date.now,
    },
});

// Ensures that product data is populated during query
orderSchema.pre('save', async function (next) {
    this.populate('items.product');
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
