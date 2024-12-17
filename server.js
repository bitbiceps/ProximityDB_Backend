import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js"; // Ensure you use the `.js` extension
import paymentRoutes from "./routes/paymentRoutes.js"; // Ensure you use the `.js` extension
import articleRouter from "./routes/articleRoutes.js";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Build the MongoDB connection string
const db = process.env.DB.replace("<db_password>", process.env.password);
console.log("Database connection string:", db);

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected successfully!!");
  })
  .catch((err) => {
    console.error("Error connecting to database", err);
  });

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/", paymentRoutes);
app.use("/article", articleRouter);

// Set the port and start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
