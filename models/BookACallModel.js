import mongoose from 'mongoose';

const BookACallSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
  },
  { timestamps: true }
);

const BookACallModel = mongoose.model('BookACAll', BookACallSchema);
export default BookACallModel;