import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
});

const checklistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Checklist", checklistSchema);