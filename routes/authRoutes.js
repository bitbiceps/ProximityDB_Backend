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
  handleGoogleLogin,
} from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validateMiddleware.js";
import passport from "../passport.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify/:token", verifyEmail);
router.get("/updated/:userId", getUserArticles);
router.post("/check-auth", checkAuth);
router.post("/reset-password", handleResetPassword);
router.post("/verify-otp", handleVerifyOtp);
router.post("/change-password", changePassword);

// Google OAuth start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  handleGoogleLogin
);

// // Logout route
// app.get('/logout', (req, res) => {
//   req.logout(() => res.redirect('/'));
// });

export default router;
