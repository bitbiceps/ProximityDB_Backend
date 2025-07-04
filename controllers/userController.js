import userModel from "../models/userModel.js";
import MessageModel from "../models/messageModal.js";

export const getFullUserDetails = async (req, res) => {
  const { user: id } = req.query;
  if (!id) {
    throw new Error("User id is mandatory");
  }
  try {
    const user = await userModel.findById(id).populate("profileImage");
    res.status(200).json({ message: "Success", user , userId : id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfileData = async (req, res) => {
  const { user: id, fields , basicQuestionnaire} = req.body;

  console.log('fields',fields);

  if (!id) {
    return res.status(400).json({ message: "User id is mandatory" });
  }

  try {
    const emailCheck = await userModel.findOne({ email: fields.email });
    if (emailCheck && emailCheck._id.toString() !== id) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Find the user by ID
    const user = await userModel
      .findById(id)
      .select("email fullName phoneNumber dateOfBirth gender industry jobTitle company");

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually update only the fields that exist in the `fields` object
    Object.keys(fields).forEach((field) => {
      // Only update the field if it exists in the user model schema
      if (user.schema.paths[field]) {
        user[field] = fields[field];
      }
    });

    // if(basicQuestionnaire && basicQuestionnaire.length === 3) {
    //   basicQuestionnaire.forEach((value , index) => {
    //     if (user.questionnaire.basicInformation[index+1]) {
    //       user.questionnaire.basicInformation[index+1].answer = value;
    //     }
    //   });
    // }


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
    if (!userId || Object.keys(answers).length !== 3) {
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
      if (user.questionnaire.basicInformation[key]) {
        user.questionnaire.basicInformation[key].answer = answers[key];
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
    const {
      user: userId,
      expertiseAndSkills,
      challengesAndGaps,
      impactAndAchievements,
      industryContextAndInsights,
    } = req.body;

    // Validate required fields (ensure they are objects and not empty)
    const isValidObject = (obj) =>
      obj && typeof obj === "object" && Object.keys(obj).length > 0;

    if (
      !userId ||
      !isValidObject(expertiseAndSkills) ||
      !isValidObject(challengesAndGaps) ||
      !isValidObject(impactAndAchievements) ||
      !isValidObject(industryContextAndInsights)
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Helper function to update questionnaire fields dynamically
    const updateField = (fieldName, data) => {
      for (const key in data) {
        if (user.questionnaire[fieldName][key]) {
          user.questionnaire[fieldName][key].answer = data[key];
        }
      }
    };

    // Update fields in the user's questionnaire
    updateField("expertiseAndSkills", expertiseAndSkills);
    updateField("challengesAndGaps", challengesAndGaps);
    updateField("impactAndAchievements", impactAndAchievements);
    updateField("industryContextAndInsights", industryContextAndInsights);

    // Save the updated user data
    const updatedUser = await user.save();

    // Respond with the updated user data
    res.status(200).json({
      message: "Secondary details added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const fetchUserMessageList = async (req, res) => {
  try {
    const { userId } = req.params; 

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch messages for the given userId, sorted by latest messages first
    const userMessages = await MessageModel.find({ userId }).sort({ updatedAt: -1 });

    if (!userMessages || userMessages.length === 0) {
      return res.status(404).json({ message: "No messages found for this user" });
    }

    return res.status(200).json({
      message: "User messages fetched successfully",
      data: userMessages,
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

