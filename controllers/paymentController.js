// const stripe = require("stripe")(
//   "sk_test_51QWIkaBBg8UnRcHybzdQ3WnonFAUkN5iAqnI3gqAobKlKihuBCu3VNBSNhvTLkuq0STGS4IUbALRcxbIfSMzS9dS00zFEgn96x"
// );
// const Payment = require("../models/paymentModel");
// exports.createPayment = async (req, res) => {
//   const { userId, amount } = req.body;
// console.log("uuuuuuu",userId,amount)
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: "inr",
//       metadata: { userId },
//     });

//     const order = new Payment({
//       userId,
//       amount,
//       paymentIntentId: paymentIntent.id,
//       status: "pending",
//     });

//     await order.save();
// console.log("gvbhnj",paymentIntent.client_secret)
//     res.status(201).json({
//       message: "Order created successfully",
//       clientSecret: paymentIntent.client_secret,
//       orderId: order._id,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const stripe = require("stripe")(
  "sk_test_51QWIkaBBg8UnRcHybzdQ3WnonFAUkN5iAqnI3gqAobKlKihuBCu3VNBSNhvTLkuq0STGS4IUbALRcxbIfSMzS9dS00zFEgn96x"
);
const Payment = require("../models/paymentModel");

exports.createPayment = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const existingPayment = await Payment.findOne({
      userId,
      amount,
      status: "pending",
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
    });

    const order = new Payment({
      userId,
      amount,
      paymentIntentId: paymentIntent.id,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
