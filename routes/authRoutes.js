import express from "express";
import { registerUser, loginUser, getUser } from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../middleware/validateMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/home", verifyToken, getUser);

export default router;
