import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.post("/", verifyUser, validate.create, controller.create);

route.get("/", verifyUser, controller.get);

route.get("/:id", verifyUser, controller.getDetails);

route.patch("/:id", verifyUser, validate.patch, controller.patch);

route.delete("/:id?", verifyUser, controller.delete);

export default route;
