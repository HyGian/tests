import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("MongoDB Connected");
        });

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom');
        
        console.log("Connected to MongoDB database");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;