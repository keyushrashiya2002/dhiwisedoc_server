import express from "express";
import morgan from "morgan";
import cors from "cors";
import { join } from "path";

import { DATABASE_URL, PORT } from "./config/env.js";
import { connectDb } from "./helper/connectDb.js";
import { decryptDataFun } from "./helper/cryptoFun.js";

import * as route from "./router.js";

// initialize server
const app = express();

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));

// Handle Client Server
var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDb(DATABASE_URL);

// Public Routes
app.use(decryptDataFun);
app.use("/api/user", route.userRoute);

// Static
app.use("/file", express.static(join(process.cwd(), "uploads")));

// Start listing server
app.listen(PORT, () => {
  console.log(`start listening on port http://localhost:${PORT}`);
});

// Uncaught exceptions and unhandled rejections
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err);
});
