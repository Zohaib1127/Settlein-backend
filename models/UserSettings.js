import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  notifications: {
    type: Boolean,
    default: true
  },

  darkMode: {
    type: Boolean,
    default: false
  },

  language: {
    type: String,
    default: "English"
  }

});

export default mongoose.model("UserSettings", userSettingsSchema);