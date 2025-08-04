
import './config/env.js';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import articleRouter from "./routes/articleRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";
import topicRouter from "./routes/topicRoutes.js";
import internalRouter from "./routes/internalRoutes.js";
import registrationRoute from "./routes/registrationRoute.js";
import imageRouter from "./routes/imageRoutes.js";
import userRouter from "./routes/userRoutes.js";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import passport from "./passport.js";
import cookieParser from 'cookie-parser';
import frontendRouter from "./routes/frontendRoutes.js"

const app = express();
let userSockets = {}; // To keep track of connected users by their socket ID

// Connect to MongoDB
const db = process.env.DB;
mongoose
  .connect(db, {
    serverSelectionTimeoutMS: 5000, // 5 seconds
  })
  .then(() => console.log("Database connected successfully!!"))
  .catch((err) => console.log("Error connecting to database", err));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // true only on HTTPS
}));

app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
// Middleware
app.use(cors({origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL, "https://staging.dashboard.proximity.press" , "https://staging.proximity.press" , "https://proximity.press", "https://internal.proximity.press" , "https://dashboard.proximity.press"] 
      : true ,
     credentials: true }));

app.use("/webhooks", webhookRouter);
app.use("/pay", express.json(), paymentRoutes);
app.use("/auth", express.json(), authRoutes);
app.use("/article", express.json(), articleRouter);
app.use("/topic", express.json(), topicRouter);
app.use("/internal", express.json(), internalRouter);
app.use("/api", express.json(), registrationRoute);
app.use("/uploads", express.static("uploads"));
app.use("/upload", imageRouter);
app.use("/user", express.json(), userRouter);
app.use("/frontend",express.json() , frontendRouter);

// Socket.IO setup
const server = http.createServer(app); // Create an HTTP server from the Express app
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Store socket ID for the user (for example, using userId or any identifier)
  socket.on("register", (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} is registered with socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId]; // Remove user from mapping when disconnected
        break;
      }
    }
    console.log("A user disconnected");
  });

  // Send notification to a specific user
  socket.on("sendNotification", (data) => {
    const { userId, message } = data;
    if (userSockets[userId]) {
      io.to(userSockets[userId]).emit("notification", message);
    }
  });
});

export const sendNotification = ({ userId, message }) => {
  if (userSockets[userId]) {
    io.to(userSockets[userId]).emit("notification", message);
    console.log(`Notification sent to user ${userId}: ${message}`);
  } else {
    console.log(`User ${userId} is not online.`);
  }
};

// Test route to ensure server is working
app.get("/", async (req, res) => {
  try {
    return res.status(200).json({ message: "Server working successfully.." });
  } catch (error) {
    return res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 3000; // Prod
// const PORT = process.env.STAGE || 3000;// Stagee

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default io;
