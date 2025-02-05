import express from 'express';
import Order from "../models/orderModels.js"

const router = express.Router();


router.get('/login', (req,res)=>{
    res.render("login");
})
router.get("/register", (req, res) => {
    res.render('register');
})
router.get("/blog", (req, res) => {
    res.render('blog');
})
router.get("/cart", (req, res) => {
    res.render('cart');
})
router.get("/checkout", (req, res) => {
    res.render('checkoutpage');
})
router.get('/orders',  (req, res) => {
    res.render("orders")
    
});



export default router;