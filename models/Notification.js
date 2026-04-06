import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  link: { type: String, default: "" },    
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: "info" },
  
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);