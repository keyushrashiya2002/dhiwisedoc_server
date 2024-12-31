import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled document" },
    html: { type: String, default: "" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

mongooseSchema.index({ createdAt: -1 });
const DocumentModel = mongoose.model("Document", mongooseSchema);

export default DocumentModel;
