import Product from "../models/productModels.js";  // Ensure correct model name
import Category from "../models/categoryModels.js";  // Assuming you have a Category model

const getProducts = async (req, res) => {  
    const { categoryId } = req.params;
    
    try {
        // Fetch products based on categoryId
        const products = await Product.find({ category: categoryId });

        // Check if products array is empty
        if (products.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No products found for this category'
            });
        }

        // Fetch the category name from the Category model
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Now pass the category name and products to the template
        const categories = [
            { 
                name: category.name, // Fetching the actual category name from database
                products: products 
            }
        ];

        // Pass the categories with products to the EJS template
        res.render('home', { categories });  // Rendering home.ejs and passing categories
    } catch (error) {
        console.error(error);  // Log error for debugging purposes
        res.status(500).json({ 
            success: false,
            message: 'Server Error. Could not get products',
            errorMessage: error.message
        });
    }
};

export { getProducts };
