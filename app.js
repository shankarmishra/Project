import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Route file imports
import userRoutes from './src/routes/userRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import local from "./src/routes/local.js";
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import connect from './src/config/connect.js';
import { buildAdminJS } from './src/config/setup.js';

// Load environment variables
dotenv.config();

// Create an Express application
const app = express();

// Fix `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(express.json());  // Parse JSON requests
app.use(express.urlencoded({ extended: true }));  // Parse form data

// Import Models
import Category from './src/models/categoryModels.js';
import Product from './src/models/productModels.js';

// User Routes
app.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        if(categories.length == 0) {
            return res.status(500).send('No categories found');
        }

        for (let i = 0; i < categories.length; i++) {
            const products = await Product.find({ category: categories[i]._id });
            categories[i].products = products;
        }
        res.render('home', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Server error');
    }
});

// User API Routes
app.use('/', local);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);

// Admin Routes
const setupAdminPanel = async (app) => {
    try {
        await buildAdminJS(app);
        console.log('✅ Admin panel initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing admin panel:', error);
        throw error;
    }
};

// Start the server function
const start = async () => {
    const PORT = process.env.PORT || 3000;
    const HOST = '0.0.0.0';

    try {
        // Connect to MongoDB
        await connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Initialize Admin Panel
        await setupAdminPanel(app);

        app.listen(PORT, HOST, () => {
            console.log(`✅ Server running at: http://localhost:${PORT}`);
            console.log(`✅ Admin panel available at: http://localhost:${PORT}/admin`);
        });
    } catch (error) {
        console.error('❌ Error during server startup:', error);
        process.exit(1);
    }
};

// Start the application
start();
