import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  type: {
    type: String,
    enum: ["room", "apartment", "studio", "hostel", "shared room"],
    required: true,
  },
  genderPreference: {
    type: String,
    enum: ["male", "female", "any"],
    default: "any",
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
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

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);

export default Listing;