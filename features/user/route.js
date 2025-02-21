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


route.get("/", verifyUser, controller.get);
route.get("/loggedin", verifyUser, controller.getLoggedin);
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

route.patch("/", verifyUser, validate.patch, controller.patch);

route.patch(
  "/changepassword",
  verifyUser,
  validate.changePassword,
  controller.changePassword
);

route.patch(
  "/resetpassword/:token",
  validate.resetPassword,
  controller.resetPassword
);

export default route;
