import mongoose from "mongoose";
import { DB_URL } from "./dotenvConfig.js";

function connectDB() {
  mongoose
    .connect(DB_URL)
    .then(() => {
      console.log(`Connected database successfully!`);
    })
    .catch(() => {
      console.log(`Connect database failed!`);
    });
}

export default connectDB;
