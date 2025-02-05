import mongoose from 'mongoose';

const connect = async (url) => {
    console.log("MONGO_URI:", url  || process.env.MONGO_URI); // Log the URI to check
    try {
        await mongoose.connect(url);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error connecting to database:', error);
    }
};

export default connect;
