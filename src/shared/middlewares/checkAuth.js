import User from "../../modules/user/user.model.js";
import { JWT_SECRET } from "../configs/dotenvConfig.js";
import createError from "../utils/createError.js";
import jwt from "jsonwebtoken";

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) return createError(res, 401, "Bạn chưa đăng nhập");

    const decoded = jwt.verify(token, JWT_SECRET);

    const userExist = await User.findById(decoded._id);
    if (!userExist) return createError(res, 404, "Unauthorized");

    if (userExist.is_locked)
      return createError(res, 403, "Tài khoản đã bị khóa");
    req.user = userExist;
    next();
  } catch (error) {
    return createError(res, 401, "Token không hợp lệ hoặc đã hết hạn");
  }
};
