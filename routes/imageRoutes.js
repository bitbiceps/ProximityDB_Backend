// imageRouter.js
import { Router } from "express";
import userModel from "../models/userModel.js";
import fs from "fs";
import { fileBaseUrl } from "../utils.js";
import profileImageModel from "../models/profileImageModel.js";
import articleImageModel from "../models/articleImageModel.js";
import articleModel from "../models/articleModels.js";
import { articleMulter, profileMulter } from "../multer.js";

const imageRouter = Router();

// Route for uploading profile image
imageRouter.post("/profile", profileMulter.single("file"), async (req, res) => {
  if (!req.file || !req.body.user) {
    return res.status(400).send("No file uploaded or user data missing.");
  }

  const cleanFilename = req.file.originalname.split(" ").join("_");
  const fileUrl = `${fileBaseUrl}${req.file.filename}`; // Correct template literal

  try {
    // Check if there's an existing profile image for the user
    const existingImage = await profileImageModel.findOne({
      user: req.body.user,
    });

    if (existingImage) {
      // Remove the old image file from the file system
      const oldFilePath = `./uploads/profile/${existingImage.filename}`; // Fixed missing backticks
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Delete the old file
      }

      // Update the existing image metadata in the database
      existingImage.filename = cleanFilename;
      existingImage.filepath = fileUrl;

      await existingImage.save(); // Save the updated image metadata

      return res.send({
        message: "Profile image updated successfully!",
        imageUrl: existingImage.filepath,
      });
    }

    // If no existing image, create a new image record in the database
    const newImage = new profileImageModel({
      filename: cleanFilename,
      filepath: fileUrl,
      user: req.body.user,
    });

    await newImage.save();

    // Update the user's profileImage field with the new image ID
    const user = await userModel.findById(req.body.user);
    user.profileImage = newImage._id;
    await user.save(); // Save the updated user document

    res.send({
      message: "Profile image uploaded successfully!",
      imageUrl: newImage.filepath,
    });
  } catch (error) {
    res.status(500).send("Error uploading file: " + error.message);
  }
});

// Route for uploading article image
imageRouter.post("/article", articleMulter.single("file"), async (req, res) => {
  if (!req.file || !req.body.article) {
    return res.status(400).send("Missing file or article");
  }

  const cleanFilename = req.file.originalname.split(" ").join("_");
  const fileUrl = `${fileBaseUrl}${req.file.filename}`;

  try {
    // Check if there's an existing image for the user
    const existingImage = await articleImageModel.findOne({
      user: req.body.user,
    });

    if (existingImage) {
      // Remove the old image file from the file system
      const oldFilePath = `./uploads/article/${existingImage.filename}`; // Fixed missing backticks
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Delete the old file
      }

      // Update the existing image metadata in the database
      existingImage.filename = cleanFilename;
      existingImage.filepath = fileUrl;

      await existingImage.save(); // Save the updated image metadata

      return res.send({
        message: "Article image updated successfully!",  // Updated message to be more appropriate
        imageUrl: existingImage.filepath,
      });
    }

    // If no existing image, create a new image record in the database
    const newImage = new articleImageModel({
      filename: cleanFilename,
      filepath: fileUrl,
      user: req.body.user,
      type: "article",
    });

    await newImage.save();

    // Update the article's profileImage field with the new image ID
    const article = await articleModel.findById(req.body.article);
    article.profileImage = newImage._id;
    await article.save(); // Save the updated article document

    res.send({
      message: "Article image uploaded successfully!",  // Updated message to be more appropriate
      imageUrl: newImage.filepath,
    });
  } catch (error) {
    res.status(500).send("Error uploading file: " + error.message);
  }
});

export default imageRouter;
