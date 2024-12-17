import express from "express";
import { createPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-payment-intent", createPayment);
router.post("/webhooks/stripe", handlePaymentWebhook);

export default router;
