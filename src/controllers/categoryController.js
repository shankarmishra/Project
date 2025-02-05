

import Category from '../models/categoryModels.js';

const getCategories = async (req, res) => {

    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({
           success: false,
           message: 'Server Error. Could not get categories',
              errorMessage: error.message
        });
    }
};
export { getCategories };
