import mongoose from "mongoose";
import { documentUserTypeEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String, required: true, default: "Untitled document" },
    html: { type: String, default: "" },
    users: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: Object.values(documentUserTypeEnum),
          default: documentUserTypeEnum.VIEWER,
        },
      },
    ],
    owner: {
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
