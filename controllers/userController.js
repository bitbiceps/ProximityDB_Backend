import userModel from "../models/userModel.js";

export const getFullUserDetails = async (req, res) => {
  const { user: id } = req.query;
  if (!id) {
    throw new Error("User id is mandatory");
  }
  try {
    const user = await userModel.findById(id).populate("profileImage");
    res.status(200).json({ message: "Success", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateUserProfileData = async (req, res) => {
  const { user: id, fields } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User id is mandatory" });
  }

  try {
    // Find the user by ID
    const user = await userModel
      .findById(id)
      .select("email fullName phoneNumber");

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually update only the fields that exist in the `fields` object
    Object.keys(fields).forEach((field) => {
      // Only update the field if it exists in the user model schema
      if (user.toObject().hasOwnProperty(field)) {
        user[field] = fields[field];
      }
    });

    // Save the updated user
    await user.save();

    // Return the updated user data as the response
    res.status(200).json({ message: "Success", user });
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ message: error.message });
  }
};

export const handleUserProfilePrimaryQuestionaire = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const { user: userId, ...answers } = req.body;

    // Validate required fields
    if (!userId || Object.keys(answers).length !== 4) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the primary questionnaire section with the new answers
    Object.keys(answers).forEach((key) => {
      if (user.questionnaire.primary[key]) {
        user.questionnaire.primary[key].answer = answers[key];
      }
    });

    // Save the updated user data
    const updatedUser = await user.save();

    // Respond with the updated user data
    res
      .status(200)
      .json({ message: "Details added successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const handleUserProfileSecondaryQuestionaire = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const { user: userId, ...answers } = req.body;

    // Validate required fields
    if (!userId || Object.keys(answers).length !== 8) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the secondary questionnaire section with the new answers
    Object.keys(answers).forEach((key) => {
      if (user.questionnaire.secondary[key]) {
        user.questionnaire.secondary[key].answer = answers[key];
      }
    });

    // Save the updated user data
    const updatedUser = await user.save();

    // Respond with the updated user data
    res
      .status(200)
      .json({
        message: "Secondary details added successfully",
        user: updatedUser,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
