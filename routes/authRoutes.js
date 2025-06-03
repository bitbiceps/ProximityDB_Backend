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
  handleLinkedInLogin,
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
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  handleGoogleLogin
);

// 🔐 Start LinkedIn auth
router.get("/linkedin", passport.authenticate("linkedin", { prompt: "login" }));

// 🌀 LinkedIn callback
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/login", // or wherever your frontend handles failed logins
    session: false,
  }),
  handleLinkedInLogin
);

// // Logout route
// app.get('/logout', (req, res) => {
//   req.logout(() => res.redirect('/'));
// });

export default router;
