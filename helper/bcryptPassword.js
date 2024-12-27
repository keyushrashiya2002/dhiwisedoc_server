import bcrypt from "bcrypt";

export const bcryptPassword = async (passwords) => {
  return await bcrypt.hash(String(passwords), 10);
};

export const comparePasswords = async (passwords, hashPassword) => {
  return await bcrypt.compare(passwords, hashPassword);
};
