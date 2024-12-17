import express from "express";
import { createPayment,handlePaymentWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-payment-intent", createPayment);
router.post("/webhooks/stripe", express.raw({ type: "application/json" }),handlePaymentWebhook);

export default router;
