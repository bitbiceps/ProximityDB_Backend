// imageRouter.js
import { Router } from "express";
import { upload } from "../multer.js";
import userModel from "../models/userModel.js";
import imageModel from "../models/imageModel.js";
import fs from "fs";
import { fileBaseUrl } from "../utils.js";

const imageRouter = Router();

imageRouter.post("/profile", upload.single("file"), async (req, res) => {
  if (!req.file || !req.body.user) {
    return res.status(400).send("No file uploaded or user data missing.");
  }

  const cleanFilename = req.file.originalname.split(" ").join("_");
  const fileUrl = `${fileBaseUrl}${req.file.filename}`;

  try {
    // Check if there's an existing profile image for the user
    const existingImage = await imageModel.findOne({
      type: "profile",
      user: req.body.user,
    });

    if (existingImage) {
      // Remove the old image file from the file system
      const oldFilePath = `./uploads/${existingImage.filename}`;
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
    const newImage = new imageModel({
      filename: cleanFilename,
      filepath: fileUrl,
      user: req.body.user,
      type: "profile",
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

export default imageRouter;
