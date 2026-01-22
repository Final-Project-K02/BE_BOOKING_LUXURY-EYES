import { CLIENT_URI } from "../../shared/configs/dotenvConfig.js";

export const getTemplateRegisterSuccess = ({ fullName }) => {
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:30px 10px;">

      <!-- Container -->
      <table width="600" cellpadding="0" cellspacing="0"
        style="background-color:#020617;border-radius:10px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding:24px;background-color:#020617;">
            <h1 style="margin:0;color:#38bdf8;font-size:26px;">
              Luxury Eyes Clinic 👁️✨
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">
              Chăm sóc & bảo vệ đôi mắt của bạn
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px;color:#e5e7eb;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 16px;">
              Xin chào <strong>${fullName}</strong>,
            </p>

            <p style="margin:0 0 16px;">
              Tài khoản của bạn tại
              <strong style="color:#38bdf8;">Luxury Eyes</strong>
              đã được tạo thành công 🎉
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="margin:20px 0;border:1px solid #1e293b;
              background-color:#020617;border-radius:6px;">
              <tr>
                <td style="padding:16px;color:#cbd5f5;font-size:14px;">
                  ✔ Đặt lịch khám mắt trực tuyến nhanh chóng  
                  <br>✔ Đội ngũ bác sĩ chuyên môn cao  
                  <br>✔ Trang thiết bị hiện đại, không gian sang trọng
                </td>
              </tr>
            </table>
            
            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td align="center">
                  <a href="${CLIENT_URI}/auth/login"
                    style="
                      display:inline-block;
                      padding:12px 28px;
                      background-color:#38bdf8;
                      color:#020617;
                      font-size:15px;
                      font-weight:bold;
                      text-decoration:none;
                      border-radius:6px;
                    ">
                    👉 Đăng nhập ngay
                  </a>
                </td>
              </tr>
            </table>


            <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
              Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.
            </p>

            <p style="margin:12px 0 0;">
              Trân trọng,  
              <br><strong>Luxury Eyes Clinic</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center"
            style="padding:16px;background-color:#020617;
            color:#64748b;font-size:12px;">
            © 2026 Luxury Eyes Clinic. All rights reserved.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};
