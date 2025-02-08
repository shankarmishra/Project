import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'; // Add this at the top
import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import Product from '../models/productModels.js';
import Category from '../models/categoryModels.js';
import Order from '../models/orderModels.js';
import Transaction from '../models/transactionModels.js';
import User from '../models/userModels.js';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { COOKIE_PASSWORD } from './config.js';

// Register Mongoose Adapter for AdminJS
AdminJS.registerAdapter(AdminJSMongoose);

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default admin credentials
const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'gmaillllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
  password: process.env.ADMIN_PASSWORD || 'passworddddddddddddddddddddddddddddddddddddddddddddddd',
};

// Authentication logic for AdminJS
const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

// Build AdminJS Dashboard
export const buildAdminJS = async (app) => {
  // Define AdminJS resources (collections to be managed in the admin panel)
  const adminJS = new AdminJS({
    resources: [
      {
        resource: Product,
        options: {
          listProperties: ['name', 'price', 'category', 'createdAt'], // Add properties to show in list
        },
      },
      {
        resource: Category,
        options: {
          listProperties: ['name', 'description', 'createdAt'], // Ensure description is included
        },
      },
      {
        resource: Order,
        options: {
          listProperties: ['productName', 'productImage', 'quantity', 'price', 'status'], // Include quantity and price
          properties: {
            productName: {
              isVisible: true,
              type: 'string',
            },
            productImage: {
              isVisible: true,
              type: 'string',
            },
            quantity: {
              isVisible: true,
              type: 'number',
            },
            price: {
              isVisible: true,
              type: 'number',
            },
          },
        },
      },
      {
        resource: Transaction,
        options: {
          listProperties: ['userId', 'totalAmount', 'paymentStatus', 'createdAt'],
        },
      },
      {
        resource: User,
        options: {
          listProperties: ['name', 'email', 'createdAt'],
        },
      },
    ],
    rootPath: '/admin', // Path where AdminJS will be available
    branding: {
      companyName: 'Green Garden Admin',
      logo: path.resolve(__dirname, '/static/logo.png'), // Correct logo path
      softwareBrothers: false, // Removes AdminJS branding
    },
    theme: 'dark', // Optional: Choose a theme like 'dark', 'light', etc.
  });

  // Set up session store for AdminJS
  const MongoDBSessionStore = connectMongoDBSession(session);
  const store = new MongoDBSessionStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
  });

  // Set up AdminJS router with authentication
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJS,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: COOKIE_PASSWORD || 'supersecretpassword',
    },
    null,
    {
      store,
      resave: false,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD || 'supersecretpassword',
    }
  );

  // Use AdminJS router in the app
  app.use(adminJS.options.rootPath, adminRouter);

  // Use express.json() as body parser (recommended in newer versions of Express)
  app.use(express.json());  // Replaces body-parser.json()
};
