import { errorResponse } from "../helper/apiResponse.js";

const errorObj = {
  details: [
    {
      path: "message",
      message: "You don't have permission to perform this action",
    },
  ],
};

export const checkAuthorization = ({
  permission,
  comparisonFn = ({ req }) => true,
}) => {
  return (req, res, next) => {
    try {
      const loginUserRole = req.user.role;

      const allowedRoles = rules[permission];

      const canAccess =
        allowedRoles?.includes(loginUserRole) && comparisonFn({ req });

      if (canAccess) {
        next();
      } else {
        return errorResponse({
          error: new Error("You don't have permission to access resource"),
          funName: "middleware.checkAuthorization",
          res,
          message: "You don't have permission to access resource",
          statusCode: 403,
        });
      }
    } catch (error) {
      return errorResponse({
        error,
        funName: "middleware.checkAuthorization",
        res,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  };
};

export const permissions = {};

const rules = {};
