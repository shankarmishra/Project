import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './src/models/productModels.js';
import Category from './src/models/categoryModels.js';
import { categoriesData, productData } from './src/seedData/seedData.js';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
    });

    console.log('Connected to the database.');

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Existing data cleared.');

    // Insert categories
    const categoriesDocs = await Category.insertMany(categoriesData);

    // Map category names to their IDs
    const categoriesMap = categoriesDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    // Replace category names with their corresponding IDs in products
    const productsWithCategoryIds = productData.map((product) => ({
      ...product,
      category: categoriesMap[product.category],
    }));

    // Insert products
    await Product.insertMany(productsWithCategoryIds);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from the database
    mongoose.connection.close();
    // console.log('Disconnected from the database.');
  }
}

// Run the seed function
seedDatabase();
