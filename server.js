import express from "express";

import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import articleRouter from "./routes/articleRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";
import topicRouter from "./routes/topicRoutes.js";

const app = express();

const db = process.env.DB.replace("<db_password>", process.env.password);
mongoose
  .connect(db)
  .then(() => console.log("Database connected successfully!!"))
  .catch((err) => console.log("Error connecting to database", err));

app.use(cors({ origin: "*" }));

app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);
app.use("/pay", express.json(), paymentRoutes);

app.use("/api/auth", express.json(), authRoutes);
app.use("/article", express.json(), articleRouter);
app.use("/topic", express.json(), topicRouter);

app.get("/", async (req, res) => {
  return res.status(200).json({ message: "Server working successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
