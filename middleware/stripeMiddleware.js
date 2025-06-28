import {stripe} from "../helpers/stripe.js"

export const verifyStripeWebhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body; 

  if (!sig) {
    return res.status(400).send('No Stripe signature header provided');
  }

  if (!payload) {
    return res.status(400).send('No webhook payload provided');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};