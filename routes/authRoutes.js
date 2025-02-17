import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  getUserArticles,
  checkAuth,
} from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify/:token", verifyEmail);
router.get("/updated/:userId", getUserArticles);
router.post("/check-auth", checkAuth);
export default router;
