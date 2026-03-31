import { uploadBufferToCloudinary } from "../../shared/services/cloudinaryUpload.js";
import createResponse from "../../shared/utils/createResponse.js";
import createError from "../../shared/utils/createError.js";

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return createError(res, 400, "Thiếu file ảnh (field name: image)");
    }

    const folder = req.body.folder || "booking-app";

    const result = await uploadBufferToCloudinary(req.file.buffer, { folder });

    return createResponse(res, 200, "Upload thành công", {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    return createError(res, 500, error.message || "Upload thất bại");
  }
};
