import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/shared/configs/connectDb.js";
import { HOST, PORT } from "./src/shared/configs/dotenvConfig.js";
import notFoundRequest from "./src/shared/middlewares/notFoundRequest.js";
import router from "./src/routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api", router);

app.use(notFoundRequest);

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
export default app;
