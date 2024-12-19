import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import articleRouter from "./routes/articleRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";
import topicRouter from "./routes/topicRoutes.js";
var app = express();
var db = process.env.DB.replace("<db_password>", process.env.password);
mongoose.connect(db).then(function () {
  return console.log("Database connected successfully!!");
})["catch"](function (err) {
  return console.log("Error connecting to database", err);
});
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use("/webhooks", express.raw({
  type: "application/json"
}), webhookRouter);
app.use("/pay", express.json(), paymentRoutes);
app.use("/api/auth", express.json(), authRoutes);
app.use("/article", express.json(), articleRouter);
app.use("/topic", express.json(), topicRouter);
app.post("/", function (req, res) {
  return res.status(200).json({
    message: "Server working successfully"
  });
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  return console.log("Server running on port ".concat(PORT));
});