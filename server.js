import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import articleRouter from "./routes/articleRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";

dotenv.config({ path: ".env" });

const app = express();

const db = process.env.DB.replace("<db_password>", process.env.password);
mongoose
  .connect(db)
  .then(() => console.log("Database connected successfully!!"))
  .catch((err) => console.log("Error connecting to database", err));

app.use(cors({ origin: "*" }));

app.use(
  "/webhooks",
  express.raw({ type: "application/json" }), 
  webhookRouter
);

app.use("/api/auth", express.json(), authRoutes);
app.use("/api", express.json(), paymentRoutes);
app.use("/article", express.json(), articleRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
