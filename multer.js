// multer.js
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';

    // Check if the uploads directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    // Remove any trailing or leading spaces from the original filename
    const cleanFilename = file.originalname.split(" ").join("_");

    // You can also add logic to handle duplicate filenames here if needed
    cb(null, cleanFilename);
  }
});
// Initialize multer with the storage settings
export const upload = multer({ storage });
