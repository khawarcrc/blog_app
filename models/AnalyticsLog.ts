// models/AnalyticsLog.ts
import mongoose from "mongoose";

const AnalyticsLogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, required: true },
    ip: String,
    userAgent: String,
    device: String,
    browser: String,
    os: String,
    country: String,
    region: String,
    city: String,
    referer: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AnalyticsLog || mongoose.model("AnalyticsLog", AnalyticsLogSchema);
