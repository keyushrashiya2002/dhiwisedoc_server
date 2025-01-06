import dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV;

console.log({ NODE_ENV });

if (NODE_ENV === "development") {
  dotenv.config({ path: ".env.dev" });
} else if (NODE_ENV === "production") {
  dotenv.config({ path: ".env" });
} else {
  process.exit();
}

export const {
  PORT,
  DATABASE_URL,
  CLIENT_URL,

  JWT_SECRET_KEY,
  ENCRYPT_SECRET_KEY,
  ENCRYPT_DATA,

  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,

  PROJECT_NAME,
} = process.env;
