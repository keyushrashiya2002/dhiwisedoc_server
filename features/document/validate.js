import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required(),
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
}

export default validate;
