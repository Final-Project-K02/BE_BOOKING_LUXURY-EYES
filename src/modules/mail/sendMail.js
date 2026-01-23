import { EMAIL_USER } from "../../shared/configs/dotenvConfig.js";
import { transporter } from "../../shared/configs/nodeMailer.js";

export const sendMail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error("Missing recipient email");
  }

  const info = await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    html,
  });

  return info;
};
