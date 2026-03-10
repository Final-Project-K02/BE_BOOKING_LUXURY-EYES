import { uploadBufferToCloudinary } from "../../shared/services/cloudinaryUpload.js";

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu file ảnh (field name: image)" });
    }

    const folder = req.body.folder || "booking-app";

    const result = await uploadBufferToCloudinary(req.file.buffer, { folder });

    return res.status(200).json({
      message: "Upload thành công",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Upload thất bại",
    });
  }
};