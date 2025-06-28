import Stripe from "stripe";
const stripe = Stripe(
  "sk_test_51QWIkaBBg8UnRcHybzdQ3WnonFAUkN5iAqnI3gqAobKlKihuBCu3VNBSNhvTLkuq0STGS4IUbALRcxbIfSMzS9dS00zFEgn96x"
);
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { sendPurchaseConfirmation , sendWelcomeWithToken } from "../helpers/mailer.js";


export const createPayment = async (req, res) => {
  const { userId, amount, planId } = req.body;
  try {
    const existingPayment = await Payment.findOne({
      userId,
    });

    if (existingPayment) {
      return res.status(400).json({
        error: "A payment for this user and amount is already in progress.",
        clientSecret: existingPayment.paymentIntentId,
        orderId: existingPayment._id,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      metadata: { userId },
      capture_method: "automatic", // Ensures automatic confirmation and capture
    });
    const order = new Payment({
      userId,
      amount,
      planId,
      paymentIntentId: paymentIntent.id,
      status: "pending",
    });
    await order.save();
    res.status(201).json({
      message: "Order created successfully",
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      order: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
      event = await stripe.webhooks.constructEvent(
        req.body,
        sig,
        "whsec_tdpRJkiDUzG0A6ktfKpmtyT6Fd4lMcTe"
      );
    } else {
      return res.status(400).json({ error: "Webhook payload was not raw" });
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const changeStatus = await Payment.findOne({
      paymentIntentId: paymentIntent.id,
    });
    const user = await User.findById(changeStatus?.userId);
    user.planId = changeStatus?.planId;
    user.paymentStatus = true;
    await user.save();
    try {
      changeStatus.status = "succeeded";
      await changeStatus.save();
    } catch (error) {
      res.status(500).json(error);
    }
  }

  res.status(200).json({ received: true });
};

const processPayment = async (paymentData) => {
  const metadata = paymentData.metadata || {};

  await Payment.create({
    sessionId: paymentData.id,
    email: paymentData.email,
    username: paymentData.username,
    userId: metadata.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null,
    amount: paymentData.amount / 100 || 0,
    planId: metadata?.planId,
    currency: paymentData.currency || "usd",
    status: paymentData.status,
    paymentIntentId: paymentData?.paymentIntentId,
  });
};

export const handleStripPayment = async (req, res) => {
  const event = req.stripeEvent;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentIntentId = session?.payment_intent || null;
      
      const customFieldName = session.custom_fields?.find(
        (field) =>
          field.key.toLowerCase() === "fullname" ||
          field.key.toLowerCase() === "name"
      )?.text?.value;

      const customerName =
        customFieldName ||
        session.customer_details?.name ||
        session.shipping?.name ||
        null;
      
      const userEmail = session.customer_details?.email;
      if (!userEmail) throw new Error("No customer email found");

      const paymentData = {
        id: session.id,
        username: customerName,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        paymentIntentId,
        currency: session.currency,
        status: session.payment_status,
        metadata: session.metadata || {},
        email: userEmail,
      };

      await processPayment(paymentData);
      
      const articleCount = parseInt(session?.metadata?.article_counts) || 0;
      const userData = {
        fullName: customerName,
        email: userEmail,
        articleCount,
        termsAccepted: true,
        isVerified : true,
      };

      const existingUser = await User.findOne({ email: userEmail });

      if (existingUser) {
        existingUser.articleCount += articleCount;
        await existingUser.save();
        await sendPurchaseConfirmation(userEmail, customerName);
      } else {
        const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, {
          expiresIn: "30m",
        });

        await User.create(userData);
        await sendWelcomeWithToken(userEmail, customerName, token);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
