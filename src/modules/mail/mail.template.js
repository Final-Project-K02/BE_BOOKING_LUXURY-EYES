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
                  <a href="${CLIENT_URI}"
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

export const getTemplateForgotPassword = ({ fullName, token }) => {
  console.log(fullName);
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:30px 10px;">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background-color:#020617;border-radius:10px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding:24px;">
            <h1 style="margin:0;color:#38bdf8;font-size:26px;">
              Luxury Eyes Clinic 👁️
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px;color:#e5e7eb;font-size:15px;line-height:1.6;">
            <p>Xin chào <strong>${fullName}</strong>,</p>

            <p>
              Chúng tôi nhận được yêu cầu <strong>khôi phục mật khẩu</strong>
              cho tài khoản Luxury Eyes của bạn.
            </p>

            <p>
              Nhấn vào nút bên dưới để đặt lại mật khẩu:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td align="center">
                  <a href="${CLIENT_URI}?token=${token}"
                    style="
                      display:inline-block;
                      padding:12px 28px;
                      background-color:#38bdf8;
                      color:#020617;
                      font-weight:bold;
                      text-decoration:none;
                      border-radius:6px;
                    ">
                    🔐 Đặt lại mật khẩu
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#94a3b8;font-size:13px;">
              ⚠ Link này sẽ hết hạn sau <strong>5 phút</strong>.
              Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
            </p>

            <p>
              Trân trọng,<br>
              <strong>Luxury Eyes Clinic</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:16px;color:#64748b;font-size:12px;">
            © 2026 Luxury Eyes Clinic
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};

export const getTemplateAppointmentDepositPaid = ({
  fullName,
  doctorName,
  appointmentDate,
  time,
  depositAmount,
  totalAmount,
  roomName,
  location,
  txnRef,
}) => {
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:30px 10px;">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background-color:#020617;border-radius:10px;overflow:hidden;">

        <tr>
          <td align="center" style="padding:24px;background-color:#020617;">
            <h1 style="margin:0;color:#38bdf8;font-size:26px;">
              Luxury Eyes Clinic
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">
              Xác nhận thanh toán tiền cọc lịch hẹn
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;color:#e5e7eb;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 16px;">Xin chào <strong>${fullName}</strong>,</p>

            <p style="margin:0 0 16px;">
              Luxury Eyes đã nhận được khoản tiền cọc cho lịch hẹn của bạn. Lịch hẹn đã được giữ chỗ thành công.
            </p>

            <p style="margin:0 0 16px;">
              Thông tin lịch hẹn của bạn như sau:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="margin:20px 0;border:1px solid #1e293b;background-color:#020617;border-radius:6px;">
              <tr>
                <td style="padding:16px;color:#cbd5f5;font-size:14px;">
                  <strong>Bác sĩ:</strong> ${doctorName}<br>
                  <strong>Ngày khám:</strong> ${appointmentDate}<br>
                  <strong>Khung gio:</strong> ${time}<br>
                  <strong>Phòng:</strong> ${roomName}<br>
                  <strong>Địa điểm:</strong> ${location}<br>
                  <strong>Tổng chi phí:</strong> ${totalAmount}<br>
                  <strong>Tiền cọc đã thanh toán:</strong> ${depositAmount}<br>
                  <strong>Mã giao dịch:</strong> ${txnRef}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;">
              Vui lòng đến đúng giờ để quá trình thăm khám diễn ra thuận lợi.
            </p>

            <p style="margin:12px 0 0;">
              Trân trọng,<br>
              <strong>Luxury Eyes Clinic</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:16px;background-color:#020617;color:#64748b;font-size:12px;">
            © 2026 Luxury Eyes Clinic
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};

export const getTemplateAppointmentPaidCanceled = ({
  fullName,
  doctorName,
  appointmentDate,
  time,
  depositAmount,
  totalAmount,
  roomName,
  location,
  reason,
}) => {
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:30px 10px;">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background-color:#020617;border-radius:10px;overflow:hidden;">

        <tr>
          <td align="center" style="padding:24px;background-color:#020617;">
            <h1 style="margin:0;color:#38bdf8;font-size:26px;">
              Luxury Eyes Clinic
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">
              Thông báo hủy lịch đã thanh toán
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;color:#e5e7eb;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 16px;">Xin chào <strong>${fullName}</strong>,</p>

            <p style="margin:0 0 16px;">
              Lịch hẹn của bạn đã được hủy thành công. Theo chính sách hiện tại, khoản tiền cọc đã thanh toán sẽ <strong>không được hoàn lại</strong>.
            </p>

            <p style="margin:0 0 16px;">
              Thông tin lịch hẹn đã hủy:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="margin:20px 0;border:1px solid #1e293b;background-color:#020617;border-radius:6px;">
              <tr>
                <td style="padding:16px;color:#cbd5f5;font-size:14px;">
                  <strong>Bác sĩ:</strong> ${doctorName}<br>
                  <strong>Ngày khám:</strong> ${appointmentDate}<br>
                  <strong>Khung giờ:</strong> ${time}<br>
                  <strong>Phòng:</strong> ${roomName}<br>
                  <strong>Địa điểm:</strong> ${location}<br>
                  <strong>Tổng chi phí:</strong> ${totalAmount}<br>
                  <strong>Tiền cọc:</strong> ${depositAmount}<br>
                  <strong>Lý do hủy:</strong> ${reason}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;">
              Nếu bạn cần đặt lại lịch khám, vui lòng truy cập hệ thống hoặc liên hệ phòng khám để được hỗ trợ.
            </p>

            <p style="margin:12px 0 0;">
              Trân trọng,<br>
              <strong>Luxury Eyes Clinic</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:16px;background-color:#020617;color:#64748b;font-size:12px;">
            © 2026 Luxury Eyes Clinic
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};

export const getTemplateAdminCanceledPaidAppointment = ({
  fullName,
  doctorName,
  appointmentDate,
  time,
  depositAmount,
  totalAmount,
  roomName,
  location,
  reason,
}) => {
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:30px 10px;">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background-color:#020617;border-radius:10px;overflow:hidden;">

        <tr>
          <td align="center" style="padding:24px;background-color:#020617;">
            <h1 style="margin:0;color:#38bdf8;font-size:26px;">
              Luxury Eyes Clinic
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">
              Thông báo hủy lịch từ phòng khám
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;color:#e5e7eb;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 16px;">Xin chào <strong>${fullName}</strong>,</p>

            <p style="margin:0 0 16px;">
              Lịch hẹn của bạn đã được phòng khám cập nhật sang trạng thái hủy.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="margin:20px 0;border:1px solid #1e293b;background-color:#020617;border-radius:6px;">
              <tr>
                <td style="padding:16px;color:#cbd5f5;font-size:14px;">
                  <strong>Bác sĩ:</strong> ${doctorName}<br>
                  <strong>Ngày khám:</strong> ${appointmentDate}<br>
                  <strong>Khung giờ:</strong> ${time}<br>
                  <strong>Phòng:</strong> ${roomName}<br>
                  <strong>Địa điểm:</strong> ${location}<br>
                  <strong>Tổng chi phí:</strong> ${totalAmount}<br>
                  <strong>Tiền cọc đã thanh toán:</strong> ${depositAmount}<br>
                  <strong>Lý do/Ghi chú từ phòng khám:</strong> ${reason}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;">
              Nếu cần hỗ trợ đặt lại lịch, vui lòng liên hệ với phòng khám.
            </p>

            <p style="margin:12px 0 0;">
              Trân trọng,<br>
              <strong>Luxury Eyes Clinic</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:16px;background-color:#020617;color:#64748b;font-size:12px;">
            © 2026 Luxury Eyes Clinic
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};
