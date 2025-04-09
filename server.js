import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postsRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware

const allowedOrigins = ['https://linked-in-frontend-three.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you're using cookies or auth headers
}));



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
