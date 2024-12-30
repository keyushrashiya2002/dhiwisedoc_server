import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });
const UserModel = mongoose.model("User", userSchema);

export default UserModel;
