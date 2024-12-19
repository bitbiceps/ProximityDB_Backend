import express from "express";
import { handlePaymentWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handlePaymentWebhook
);
export default router;
