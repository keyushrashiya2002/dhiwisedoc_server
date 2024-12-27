import mongoose from "mongoose";
import { PROJECT_NAME } from "../config/env.js";

export const connectDb = async (url) => {
  try {
    mongoose.connect(url, { dbName: PROJECT_NAME });
    console.log("database connection established");
  } catch (error) {
    console.log("error: ", error);
  }
};
