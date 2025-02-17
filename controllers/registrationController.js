import registrationModel from "../models/registrationModel.js";

export const userRegistration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      prRequireFor,
      prObjective,
      additionalInfo,
    } = req.body;

    // Create and save a new registration entry
    const newRegistration = await registrationModel.create({
      firstName,
      lastName,
      email,
      phone,
      prRequireFor,
      prObjective,
      additionalInfo,
    });

    return res.status(201).json({
      message: "You have successfully registered.",
      data: newRegistration,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred during user registration.",
      error: error.message,
    });
  }
};
