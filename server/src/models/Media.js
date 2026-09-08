import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    // Set only when the file lives in Vercel Blob; used to delete it later.
    blobUrl: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    label: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Media", MediaSchema);
