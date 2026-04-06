import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Property title is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  address: { 
    type: String, 
    required: [true, "Address is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  type: {
    type: String,
    enum: ["room", "apartment", "studio", "hostel", "shared room"], 
    required: [true, "Property type is required"],
    lowercase: true, 
  },
  genderPreference: {
    type: String,
    enum: ["male", "female", "any"],
    default: "any",
  },
  description: {
    type: String,
    required: false, 
  },
  
  images: {
    type: [String],
    default: []
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "pending", "rented"]
  }
}, { timestamps: true });


const Partner = mongoose.models.Listing || mongoose.model("Listing", partnerSchema);

export default Partner;