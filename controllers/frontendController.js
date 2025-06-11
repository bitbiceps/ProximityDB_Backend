import createClickUpTask from "../helpers/clickUpFrontend.js";
import BookACallModel from "../models/BookACallModel.js";
import Subscriber from "../models/subscribersModel.js";
export const BookACall = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, message } = req.body;

    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const bookACall = await BookACallModel.create({
      fullName,
      email,
      phoneNumber,
      message,
    });
    bookACall.save();

    const description = `
      Full Name: ${fullName}\n  
      Email: ${email}\n  
      Phone Number: ${phoneNumber}\n
      Message: ${message}\n
`;

    const task = await createClickUpTask({
        description ,
        formData : {...req.body}
    });
    res.status(200).json(task);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create task", error: error.message });
  }
};


export const Subscribe = async (req , res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already subscribed.' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.', error: err.message });
  }
}


