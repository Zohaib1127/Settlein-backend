import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  service: { type: String, required: true },
  number: { type: String, required: true },
  city: { type: String, required: true },
  icon: { type: String }
}, { collection: 'emergencycontacts' }); 

export default mongoose.model("EmergencyContact", contactSchema);