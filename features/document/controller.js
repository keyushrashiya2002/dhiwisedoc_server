import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { isExist } from "../../helper/isExist.js";
import DocumentModel from "./model.js";

class controller {
  static create = async (req, res) => {
    try {
      req.body.user = req.user._id;
      const result = await DocumentModel.create(req.body);
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
      if (title) filter.title = { $regex: title, $options: "i" };

      const { skip, limit } = paginationFun(req.query);
      const result = await DocumentModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

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
      const result = await DocumentModel.findById(id);

      if (String(result.user) !== String(req.user._id))
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

      if (String(doc.user) !== String(req.user._id))
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

      if (String(doc.user) !== String(req.user._id))
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
        funName: "document.patch",
      });
    }
  };
}
export default controller;
