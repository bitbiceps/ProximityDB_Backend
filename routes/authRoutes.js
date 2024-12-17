import express from "express";
<<<<<<< HEAD
import { registerUser, loginUser ,verifyEmail} from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../middleware/validateMiddleware.js";
=======
import {
  registerUser,
  loginUser,
  getUser,
} from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validateMiddleware.js";
>>>>>>> feature/articles
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get('/verify/:token',verifyEmail)

// router.get("/home", verifyToken, getUser);
export default router;
