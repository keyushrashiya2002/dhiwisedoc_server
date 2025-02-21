import { CLIENT_URL } from "../../config/env.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { bcryptPassword } from "../../helper/bcryptPassword.js";

import { generateToken } from "../../helper/jwtToken.js";
import { sendMail } from "../../helper/nodeMailer.js";

import UserModel from "./model.js";

class controller {
  static register = async (req, res) => {
    const { email, username, password } = req.body;
    try {
      // Make sure user is not already registered
      const user = await UserModel.findOne({ email });

      if (user) {
        return errorResponse({
          res,
          message: `Email is already taken or not available`,
        });
      }
      const hashPassword = await bcryptPassword(password);
      let document = {
        username,
        email,
        password: hashPassword,
      };

      const { _id } = await UserModel.create(document);

      const token = await generateToken({
        userId: _id,
      });

      return successResponse({
        res,
        statusCode: 201,
        message: "User successfully registered",
        data: { user: { _id, username, email }, token },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "register",
      });
    }
  };

  static login = async (req, res) => {
    try {
      const token = await generateToken({
        userId: req.user._id,
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "User Login successfully",
        data: {
          token: token,
          user: req.user,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "login",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const { text } = req.query;
      const result = await UserModel.find({
        $or: [
          { username: { $regex: text, $options: "i" } },
          { email: { $regex: text, $options: "i" } },
        ],
      }).select("username email _id");

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getUser",
      });
    }
  };

  static getById = async (req, res) => {
    try {
      const { id } = req.params;

      let result = (await UserModel.findById(id)).toObject();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getUser",
      });
    }
  };

  static getLoggedin = async (req, res) => {
    try {
      let result = req.user;

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getUser",
      });
    }
  };

  static patch = async (req, res) => {
    try {
      let result = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: req.body,
        },
        { new: true }
      ).select("-password -createdAt -updatedAt -__v");

      return successResponse({
        res,
        statusCode: 200,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "changePassword",
      });
    }
  };

  static changePassword = async (req, res) => {
    const { password } = req.body;
    try {
      const hashPassword = await bcryptPassword(password);
      await UserModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: { password: hashPassword },
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        message: "Change password successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "changePassword",
      });
    }
  };

  static forgotPassword = async (req, res) => {
    try {
      const token = await generateToken({ userId: req.user._id });

      const link = `${CLIENT_URL}/auth/reset-password/${token}`;

      await sendMail({
        to: req.user.email,
        subject: "Password Reset Request",
        dynamicData: {
          username: req.user.username,
          email: req.user.email,
          link: link,
        },
        filename: "forgotpassword.html",
      });
      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password mail successfully send to your email address",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "forgotPassword",
      });
    }
  };

  static resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
      const hashPassword = await bcryptPassword(password);
      await UserModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: { password: hashPassword },
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "resetPassword",
      });
    }
  };
}
export default controller;
