import { Router } from "express";
import { checkAuth } from "../../shared/middlewares/checkAuth.js";
import { uploadImage } from "../../shared/middlewares/uploadMemory.js";
import { uploadSingleImage } from "./upload.controller.js";

const uploadRouter = Router();

// field name phải là "image"
uploadRouter.post("/image", checkAuth, uploadImage.single("image"), uploadSingleImage);

export default uploadRouter;