// models/counterModel.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "ticket"
  seq: { type: Number, default: 100 },
});

const CounterModel = mongoose.model('Counter', counterSchema);
export default CounterModel;
