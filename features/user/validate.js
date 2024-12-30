import Joi from "joi";
import UserModel from "./model.js";

import { errorResponse, validateResponse } from "../../helper/apiResponse.js";
import { comparePasswords } from "../../helper/bcryptPassword.js";
import { verifyToken } from "../../helper/jwtToken.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";

const options = {
  abortEarly: false,
};

class validate {
  static register = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      username: Joi.string().required().label("username"),
      email: Joi.string().required().label("email").email(),
      password: Joi.string().required().label("password"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static login = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().required().label("email"),
      password: Joi.string().required().label("password"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    const { email, password } = req.body;

    let user = await UserModel.findOne({ email }).select(
      "-createdAt -updatedAt -__v"
    );

    if (!user)
      return errorResponse({ res, message: "invalid user credentials" });

    if (!user.password)
      return errorResponse({
        res,
        message: "You have to login with social media",
      });

    const verifyPassword = await comparePasswords(password, user.password);

    if (!verifyPassword)
      return errorResponse({ res, message: "invalid user credentials" });

    user = user.toObject();

    delete user.password;
    req.user = user;
    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      username: Joi.string().empty().label("firstName"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static forgotPassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().required().label("email"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    let user = await UserModel.findOne({ email: req.body.email });

    if (!user)
      return errorResponse({
        res,
        message: "user with this email dose not exist",
      });

    req.user = user;

    next();
  };

  static resetPassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      password: Joi.string()
        .required()
        .label("password")
        .invalid(Joi.ref("old_password")),
      confirm_password: Joi.string().valid(Joi.ref("password")).required(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    const { token } = req.params;
    const checkToken = await verifyToken(token);

    if (!checkToken) return validateResponse(res, AuthErrorObj);
    const user = await UserModel.findById(checkToken.userId);
    req.user = user;

    next();
  };

  static changePassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      old_password: Joi.string().required().label("old_password"),
      password: Joi.string()
        .required()
        .label("password")
        .invalid(Joi.ref("old_password")),
      confirm_password: Joi.string().valid(Joi.ref("password")).required(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    const { password } = await UserModel.findById(req.user._id).select(
      "password"
    );
    const verifyPassword = await comparePasswords(
      req.body.old_password,
      password
    );

    if (!verifyPassword)
      return errorResponse({ res, message: "old password is incorrect" });

    next();
  };
}

export default validate;
