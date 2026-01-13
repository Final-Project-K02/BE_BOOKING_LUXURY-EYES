import dotenv from "dotenv";

dotenv.config({});

export const {
  HOST,
  PORT,
  DB_URL,
  JWT_SECRET,
  JWT_SECRET_IN,
  JWT_REFRESH,
  JWT_REFRESH_IN,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;
