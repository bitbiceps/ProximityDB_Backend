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

export const handleUserProfileQuestionaire = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      user: userId,
      fieldOrIndustry,
      skillOrArea,
      mainOutcome,
      optional = {}, // Default to an empty object if optional is not provided
    } = req.body;

    // Validate required fields
    if (!userId || !fieldOrIndustry || !skillOrArea || !mainOutcome) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user’s profile with the new details
    user.industryFieldOfWork = fieldOrIndustry;

    // Update the questionnaire with the new answers
    user.questionnaire.primary = {
      fieldOrIndustry: {
        question: "What field or industry do you primarily work in?",
        answer: fieldOrIndustry,
      },
      skillOrArea: {
        question: "What is your primary skill or area of expertise?",
        answer: skillOrArea,
      },
      mainOutcome: {
        question:
          "What’s the main outcome you seek from using this platform/product?",
        answer: mainOutcome,
      },
    };

    // Conditionally update optional fields if provided
    if (optional.specialization) {
      user.questionnaire.optional = user.questionnaire.optional || {}; // Initialize optional if not already
      user.questionnaire.optional.specialization = {
        question: "What areas of your field do you specialize in?",
        answer: optional.specialization,
      };
    }

    if (optional.problemToSolve) {
      user.questionnaire.optional = user.questionnaire.optional || {}; // Initialize optional if not already
      user.questionnaire.optional.problemToSolve = {
        question:
          "What specific problem are you looking to solve or improve in your work?",
        answer: optional.problemToSolve,
      };
    }

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
