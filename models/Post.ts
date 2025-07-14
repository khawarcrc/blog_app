import mongoose from "mongoose";

// Define comment sub-schema
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Extend Post schema
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: { type: Number, default: 0 },
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },

    //  Add comments array
    comments: [commentSchema],
  },
  { timestamps: true }
);


// Indexes
PostSchema.index({ title: "text", content: "text" });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
