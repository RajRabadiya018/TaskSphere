import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Connects to MongoDB Atlas using the URI from .env
// If connection fails, the server process exits immediately
const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        await mongoose.connect(uri);
        console.log("✅ MongoDB Atlas connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
