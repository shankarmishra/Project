import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema({
    name: { type: String, required: true },
    image_uri: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // Array of products
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
