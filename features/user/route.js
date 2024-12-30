import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";
import { authRoleEnum } from "../../config/enum.js";

const route = express.Router();

route.post("/register", validate.register, controller.register);
route.post("/login", validate.login, controller.login);

route.get(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_USER,
    comparisonFn: ({ req }) => {
      const { _id, role } = req.user;
      const { id } = req.params;

      // user role can access only own record
      if (role === authRoleEnum.USER && String(_id) !== String(id)) {
        return false;
      }

      return true;
    },
  }),
  controller.getById
);

route.post(
  "/forgotpassword",
  validate.forgotPassword,
  controller.forgotPassword
);

route.patch(
  "/changepassword",
  verifyUser,
  validate.changePassword,
  controller.changePassword
);

route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_USER_PROFILE,
    comparisonFn: ({ req }) => {
      const { role, _id } = req.user;

      // Patch own profile for user
      if (String(_id) === String(req.params.id)) {
        return true;
      } else {
        return false;
      }
    },
  }),
  validate.patch,
  controller.patch
);

route.patch(
  "/resetpassword/:token",
  validate.resetPassword,
  controller.resetPassword
);

export default route;
