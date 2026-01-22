import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import { getTemplateRegisterSuccess } from "../mail/mail.template.js";
import { sendMail } from "../mail/sendMail.js";
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";
import { toPublicUser } from "../user/user.presentor.js";
import { CLIENT_URI } from "../../shared/configs/dotenvConfig.js";
export const register = handleAsync(async (req, res) => {
  const { email, password, userName } = req.body;

  const userExit = await User.findOne({ email });
  if (userExit)
    return createError(
      res,
      400,
      "Email đã tồn tại. Vui lòng sử dụng email khác",
    );
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = await User.create({ email, password: hash, userName });

  sendMail({
    to: email,
    subject: "Đăng ký tài khoản thành công | Luxury Eyes",
    html: getTemplateRegisterSuccess({
      userName,
      // loginUrl: CLIENT_URI + "/auth/login",
    }),
  }).catch((err) => {
    console.error("Send mail failed:", err.message);
  });

  // user.password = undefined;
  return createResponse(res, 201, "Đăng ký thành công", toPublicUser(user));
});
