import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  documentUserTypeEnum,
  documentUserTypeWithRemoveEnum,
} from "../../config/enum.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().allow(""),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().empty(),
      hmtl: Joi.string().empty(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static addUser = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      users: Joi.array().required().min(1),
      type: Joi.string()
        .required()
        .valid(...Object.values(documentUserTypeEnum)),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patchUser = async (req, res, next) => {
    const validateSchema = Joi.array()
      .min(1)
      .items({
        _id: Joi.string().required().label("id"),
        userId: Joi.string().required().label("userId"),
        type: Joi.string()
          .required()
          .valid(...Object.values(documentUserTypeWithRemoveEnum))
          .label("type"),
      });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
