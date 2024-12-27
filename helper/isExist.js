import mongoose from "mongoose";
import { validateResponse } from "./apiResponse.js";

const errObj = {
  details: [
    {
      path: "message",
      message: "document not found",
    },
  ],
};

export const isExist = async (res, id, Model, populate) => {
  try {
    const checkId = mongoose.Types.ObjectId.isValid(id);
    if (!checkId) return validateResponse(res, errObj);

    const result = await Model.findById(id).populate(populate);
    if (result === null) return validateResponse(res, errObj);

    return result;
  } catch (error) {
    throw error;
  }
};
