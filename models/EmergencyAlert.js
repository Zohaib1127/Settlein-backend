import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, default: "Emergency! Need immediate help." },
  location: { lat: Number, lng: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("EmergencyAlert", alertSchema);