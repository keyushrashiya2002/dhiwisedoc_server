import nodemailer from "nodemailer";
import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from "./env.js";

const smtpConfig = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export const mailTransport = nodemailer.createTransport(smtpConfig);
