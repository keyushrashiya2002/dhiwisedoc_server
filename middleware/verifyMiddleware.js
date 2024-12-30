import UserModel from "../features/user/model.js";
import { validateResponse } from "../helper/apiResponse.js";

import { verifyToken } from "../helper/jwtToken.js";

export const AuthErrorObj = {
  details: [
    {
      path: "message",
      message: "Authorization credential ware not found or invalid",
    },
  ],
};

export const verifyUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) return validateResponse(res, AuthErrorObj);
    if (!authorization.startsWith("Bearer "))
      return validateResponse(res, AuthErrorObj);

    const { userId } = await verifyToken(authorization.split(" ")[1]);

    let user = await UserModel.findById(userId).select(
      "-password -createdAt -updatedAt -__v"
    );

    if (!user || !user.isActive)
      return validateResponse(res, AuthErrorObj, 403);

    req.user = user;

    next();
  } catch (error) {
    return validateResponse(res, AuthErrorObj, 401);
  }
};
