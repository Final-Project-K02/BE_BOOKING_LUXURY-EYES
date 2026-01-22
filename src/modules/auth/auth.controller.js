import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import { getTemplateRegisterSuccess } from "../mail/mail.template.js";
import { sendMail } from "../mail/sendMail.js";
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { toPublicUser } from "../user/user.presentor.js";
import {
  JWT_REFRESH,
  JWT_REFRESH_IN,
  JWT_SECRET,
  JWT_SECRET_IN,
} from "../../shared/configs/dotenvConfig.js";

// register
export const register = handleAsync(async (req, res) => {
  const { email, password, fullName } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist)
    return createError(
      res,
      400,
      "Email đã tồn tại. Vui lòng sử dụng email khác",
    );
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = await User.create({ email, password: hash, fullName });

  sendMail({
    to: email,
    subject: "Đăng ký tài khoản thành công | Luxury Eyes",
    html: getTemplateRegisterSuccess({
      fullName,
    }),
  }).catch((err) => {
    console.error("Send mail failed:", err.message);
  });

  createResponse(res, 201, "Đăng ký thành công", toPublicUser(user));
});

// login
export const login = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  const userExist = await User.findOne({ email }).select("+password");
  if (!userExist)
    return createError(res, 401, "Email hoặc mật khẩu không đúng");

  if (userExist.is_locked) return createError(res, 403, "Tài khoản đã bị khóa");

  const isMatched = await bcrypt.compare(password, userExist.password);
  if (!isMatched)
    return createError(res, 401, "Email hoặc mật khẩu không đúng");

  const accessToken = jwt.sign(
    { _id: userExist._id, role: userExist.role },
    JWT_SECRET,
    {
      expiresIn: JWT_SECRET_IN,
    },
  );

  const refreshToken = jwt.sign({ _id: userExist._id }, JWT_REFRESH, {
    expiresIn: JWT_REFRESH_IN,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // JS Không đọc được
    secure: false, // Chỉ gửi qua https
    sameSite: "strict", // Chống CSRF,
  });

  userExist.refreshToken = refreshToken;
  await userExist.save();

  createResponse(res, 200, "Đăng nhập thành công", {
    user: toPublicUser(userExist),
    accessToken,
  });
});

// refresh token
export const refreshToken = handleAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return createError(res, 401, "Unauthenticated");

  const payload = jwt.verify(refreshToken, JWT_REFRESH);
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!payload || !user) return createError(res, 401, "Refresh Token invalid");

  const accessToken = jwt.sign({ _id: payload._id }, JWT_SECRET, {
    expiresIn: JWT_SECRET_IN,
  });

  const newRefreshToken = jwt.sign({ _id: user._id }, JWT_REFRESH, {
    expiresIn: JWT_REFRESH_IN,
  });
  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true, // JS Không đọc được
    secure: false, // Chỉ gửi qua https
    sameSite: "strict", // Chống CSRF,
  });
  return createResponse(res, 200, "OK", accessToken);
});
