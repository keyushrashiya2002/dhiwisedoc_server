import { ENCRYPT_DATA, ENCRYPT_SECRET_KEY } from "../config/env.js";
import CryptoJS from "crypto-js";

const doEncrtpyData = ENCRYPT_DATA === "true";

const secretKey = CryptoJS.enc.Utf8.parse(
  ENCRYPT_SECRET_KEY.padEnd(32, "0").substring(0, 32)
);
export const encryptedData = (data) => {
  if (!doEncrtpyData) return data;

  // Generate random IV (Initialization Vector) - 16 bytes
  const iv = CryptoJS.lib.WordArray.random(16);

  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey, // Secret key parsed as WordArray
    { iv: iv }
  );

  // Convert IV and ciphertext to proper formats
  const ivString = iv.toString(CryptoJS.enc.Hex); // IV as Hex string
  const ciphertext = encrypted.toString(); // Ciphertext is in Base64

  // Return as JSON
  return { iv: ivString, ciphertext: ciphertext };
};

export const decryptDataFun = (req, res, next) => {
  if (!doEncrtpyData) return next();

  if (req.body.ciphertext && req.body.iv) {
    const bodyIvHex = CryptoJS.enc.Hex.parse(req.body.iv);

    const bodyDecrypted = CryptoJS.AES.decrypt(req.body.ciphertext, secretKey, {
      iv: bodyIvHex,
    });

    // Convert decrypted data to string and parse it
    const bodyDecryptedData = bodyDecrypted.toString(CryptoJS.enc.Utf8);
    req.body = JSON.parse(bodyDecryptedData);
  }

  next();
};
