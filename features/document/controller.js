import {
  documentUserTypeEnum,
  documentUserTypeWithRemoveEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { isExist } from "../../helper/isExist.js";
import { errorObj } from "../../middleware/checkAuthorization.js";
import DocumentModel from "./model.js";

export const updateDocumentContent = async (roomId, content) => {
  await DocumentModel.findByIdAndUpdate(
    roomId,
    {
      $set: { html: content },
    },
    { new: true }
  );
};

class controller {
  static create = async (req, res) => {
    try {
      req.body.owner = req.user._id;
      const create = await DocumentModel.create(req.body);
      const result = await DocumentModel.findById(create._id).populate([
        { path: "owner", select: "username email" },
        { path: "users.userId", select: "username email" },
      ]);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Document created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "document.create",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const { title } = req.query;

      let filter = {};

      filter.$or = [
        { users: { $elemMatch: { userId: req.user._id } } },
        { owner: req.user._id },
      ];

      if (title) filter.title = { $regex: title, $options: "i" };

      const { skip, limit } = paginationFun(req.query);
      const result = await DocumentModel.find(filter)
        .select("-html")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          { path: "owner", select: "username email" },
          { path: "users.userId", select: "username email" },
        ]);

      const count = await DocumentModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
        pagination,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "document.get",
      });
    }
  };

  static getDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await DocumentModel.findById(id).populate([
        { path: "owner", select: "username email" },
        { path: "users.userId", select: "username email" },
      ]);

      const userIds = result.users.map((user) => String(user.userId._id));

      if (
        String(result.owner._id) !== String(req.user._id) &&
        !userIds.includes(String(req.user._id))
      )
        return errorResponse({
          res,
          message: `You don't have permission to perform this action`,
        });

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
        funName: "document.getDetails",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, DocumentModel);

      if (String(doc.owner) !== String(req.user._id))
        return errorResponse({
          res,
          message: `You don't have permission to perform this action`,
        });

      await DocumentModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Documents deleted successfully",
        data: id,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "document.delete",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, DocumentModel);

      const canEdit = doc.users.find(
        (user) =>
          String(user.userId) === String(req.user._id) &&
          user.type === documentUserTypeEnum.EDITOR
      );

      if (String(doc.owner) !== String(req.user._id) && !canEdit)
        return errorResponse({
          res,
          message: `You don't have permission to perform this action`,
        });

      const result = await DocumentModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      ).select("title");

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "document.patch",
      });
    }
  };

  static addUser = async (req, res) => {
    const { id } = req.params;
    const { users, type } = req.body;

    try {
      const document = await isExist(res, id, DocumentModel);
      if (String(req.user._id) !== String(document.owner)) {
        return validateResponse(res, errorObj, 403);
      }

      const existingUsers = await DocumentModel.findById(id, "users");

      const usersToAdd = users.filter((userId) => {
        return !existingUsers.users.some(
          (existingUser) => existingUser.userId.toString() === userId
        );
      });

      const newUsers = usersToAdd.map((userId) => ({ userId, type }));

      const updateObj = {
        $addToSet: {
          users: { $each: newUsers },
        },
      };
      const result = await DocumentModel.findByIdAndUpdate(id, updateObj, {
        new: true,
      });

      const doc = await result.populate([
        { path: "owner", select: "username email" },
        { path: "users.userId", select: "username email" },
      ]);

      return successResponse({
        res,
        statusCode: 200,
        data: doc,
        message: "Document updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Document",
      });
    }
  };

  static patchUser = async (req, res) => {
    const { docId } = req.params;
    try {
      const document = await isExist(res, docId, DocumentModel);

      const canEdit = document.users.find(
        (user) =>
          String(user.userId) === String(req.user._id) &&
          user.type === documentUserTypeEnum.EDITOR
      );

      if (String(req.user._id) !== String(document.owner) && !canEdit) {
        return validateResponse(res, errorObj, 403);
      }

      for (const updatedUser of req.body) {
        const { _id, type } = updatedUser;
        if (type === documentUserTypeWithRemoveEnum.REMOVE) {
          await DocumentModel.updateOne(
            { _id: docId },
            { $pull: { users: { _id } } }
          );
        } else {
          await DocumentModel.updateOne(
            { _id: docId, "users._id": _id },
            { $set: { "users.$.type": type } }
          );
        }
      }

      const updatedDocument = await DocumentModel.findById(docId);

      const doc = await updatedDocument.populate([
        { path: "owner", select: "username email" },
        { path: "users.userId", select: "username email" },
      ]);

      return successResponse({
        res,
        statusCode: 200,
        data: doc,
        message: "Document updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Document",
      });
    }
  };

  static removeUser = async (req, res) => {
    const { id } = req.params;
    try {
      const document = await isExist(res, id, DocumentModel);

      const canEdit = document.users.find(
        (user) =>
          String(user.userId) === String(req.user._id) &&
          user.type === documentUserTypeEnum.EDITOR
      );

      if (String(req.user._id) !== String(document.owner) && !canEdit) {
        return validateResponse(res, errorObj, 403);
      }

      const result = await DocumentModel.findByIdAndUpdate(
        id,
        {
          $pull: { users: { userId: req.user._id } },
        },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Document",
      });
    }
  };

  static deleteUser = async (req, res) => {
    const { docId, id } = req.params;
    try {
      const document = await isExist(res, docId, DocumentModel);
      if (String(req.user._id) !== String(document.owner)) {
        return validateResponse(res, errorObj, 403);
      }
      const result = await DocumentModel.findOneAndUpdate(
        { _id: docId },
        {
          $pull: {
            users: { _id: id }, // Remove the user by their ID
          },
        },
        {
          new: true,
        }
      );
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Document",
      });
    }
  };
}
export default controller;
