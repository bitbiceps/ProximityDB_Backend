import multer from 'multer';
import fs from 'fs';

// Helper function to initialize multer storage with directory creation and filename cleanup
const createStorage = (uploadDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the upload directory exists, and create it recursively if not
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create parent directories as needed
    }
    cb(null, uploadDir); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    // Clean up the filename by replacing spaces with underscores
    const cleanFilename = file.originalname.split(" ").join("_");
    cb(null, cleanFilename); // Return the cleaned-up filename
  }
});

// Article image storage configuration
export const articleMulter = multer({
  storage: createStorage('./uploads/article'), // Using the helper function
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit the file size to 5MB
  fileFilter: (req, file, cb) => {
    // Optional: Check for allowed image types (jpeg, png, gif)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true); // Allow the file
  }
});

// Profile image storage configuration
export const profileMulter = multer({
  storage: createStorage('./uploads/profile'), // Using the same helper function
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit the file size to 5MB
  fileFilter: (req, file, cb) => {
    // Optional: Check for allowed image types (jpeg, png, gif)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true); // Allow the file
  }
});
