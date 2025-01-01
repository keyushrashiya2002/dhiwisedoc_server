import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
const route = express.Router();

route.get("/", controller.get);
route.get("/:id", controller.getDetails);

route.post("/", validate.create, controller.create);
route.post("/users/:id", validate.addUser, controller.addUser);

route.patch("/:id", validate.patch, controller.patch);
route.patch("/users/:docId", validate.patchUser, controller.patchUser);
route.patch("/remove/:id", controller.removeUser);

route.delete("/:id?", controller.delete);
route.delete("/users/:docId/:id", controller.deleteUser);

export default route;
