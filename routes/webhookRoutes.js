import express from "express";
import { handlePaymentWebhook , handleStripPayment } from "../controllers/paymentController.js";
import { verifyStripeWebhook } from "../middleware/stripeMiddleware.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handlePaymentWebhook
);

router.post(
  "/stripe-checkout",
  express.raw({ type: "application/json" }),
  verifyStripeWebhook,
  handleStripPayment
);
export default router;
