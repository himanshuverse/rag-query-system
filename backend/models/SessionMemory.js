import mongoose from "mongoose";

const subdocOptions = { _id: false, timestamps: { createdAt: true, updatedAt: false } };

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ["user", "assistant", "system"] },
    text: { type: String, required: true, trim: true },
  },
  subdocOptions
);

const uploadSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    preview:  { type: String, default: "" },
    chunks:   { type: Number, default: 0, min: 0 },
  },
  subdocOptions
);

const sessionMemorySchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, trim: true },
    summary:   { type: String, default: "" },
    messages:  { type: [messageSchema], default: [] },
    uploads:   { type: [uploadSchema],  default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("SessionMemory", sessionMemorySchema);