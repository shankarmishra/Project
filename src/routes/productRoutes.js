import express from 'express';
import { getProducts } from '../controllers/productController.js';
const router = express.Router();



router.post('/:categoryId',getProducts);

export default router;