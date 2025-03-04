import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  getUserArticles,
  checkAuth,
  handleResetPassword,
  handleVerifyOtp,
  changePassword,
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
router.post("/reset-password",handleResetPassword)
router.post("/verify-otp",handleVerifyOtp)
router.post("/change-password",changePassword)
export default router;
