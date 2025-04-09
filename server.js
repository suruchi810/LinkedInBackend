import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postsRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "https://linked-in-frontend-three.vercel.app/", // Correct the origin to match your front-end
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

app.use(postsRoutes);
app.use(userRoutes);
app.use(express.static("profile_pictures"));

// Start server function
const start = async () => {
    try {
        // Database Connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Start Server
        app.listen(9000, () => {
            console.log("Server is running");
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit process with failure
    }
};

// Start the app
start();
