import mongoose from "mongoose";

const roommateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    city: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    genderPreference: { type: String, enum: ["male", "female", "any"], default: "any" },
    smoking: { type: Boolean, default: false },
    studyLevel: { type: String, enum: ["BS", "MS", "PhD", "Other"], default: "Other" },
    cleanliness: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    bio: { type: String },
    
    // --- Connection Requests Array ---
    requests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { 
          type: String, 
          enum: ["pending", "accepted", "rejected"], 
          default: "pending" 
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("RoommateProfile", roommateSchema);