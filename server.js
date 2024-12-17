import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js"; // Ensure you use the `.js` extension
import paymentRoutes from "./routes/paymentRoutes.js"; // Ensure you use the `.js` extension

dotenv.config({ path: ".env" });

const db = process.env.DB.replace("<db_password>", process.env.password);
console.log("dbbb", db);
mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected successfully!!");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

const app = express();

app.use(cors({ origin: "*" }));

app.use("/api/auth", express.json(), authRoutes);

app.use("/", express.json(), paymentRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
