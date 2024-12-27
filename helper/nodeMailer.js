import { mailTransport } from "../config/mailTransport.js";
import fs from "fs";
import { join } from "path";
import { MAIL_FROM } from "../config/env.js";

export const sendMail = async ({ to, subject, dynamicData, filename }) => {
  let html = fs.readFileSync(
    join(process.cwd(), "pages", "mail", filename),
    "utf-8"
  );
  Object.keys(dynamicData).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    html = html.replace(regex, dynamicData[key]);
  });

  const result = mailTransport.sendMail(
    {
      from: MAIL_FROM,
      to,
      subject,
      html,
    },
    async (err, info) => {
      if (err) {
        return err.message;
      } else {
        console.log(`mail successfully sent on ${info.accepted[0]}`);
        return info;
      }
    }
  );
  return result;
};
