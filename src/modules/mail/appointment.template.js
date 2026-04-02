const getContactInfoBlock = ({ clinicEmail, clinicPhone }) => {
  return `
            <table width="100%" cellpadding="0" cellspacing="0"
              style="margin:16px 0;border:1px solid #1e293b;background-color:#020617;border-radius:6px;">
              <tr>
                <td style="padding:16px;color:#cbd5f5;font-size:14px;">
                  <strong>Email phòng khám:</strong> ${clinicEmail}<br>
                  <strong>Số điện thoại phòng khám:</strong> ${clinicPhone}
                </td>
              </tr>
            </table>
`;
};

const getRebookButton = ({ rebookUrl }) => {
  return `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td align="center">
                  <a href="${rebookUrl}"
                    style="display:inline-block;padding:12px 28px;background-color:#38bdf8;color:#020617;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">
                    Đặt lịch mới
                  </a>
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
  clinicEmail,
  clinicPhone,
  rebookUrl,
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
                  <strong>Mã giao dịch:</strong> ${txnRef}<br>
                  <strong>Người hủy lịch:</strong> Chưa hủy
                </td>
              </tr>
            </table>

${getContactInfoBlock({ clinicEmail, clinicPhone })}

${getRebookButton({ rebookUrl })}

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
  canceledBy,
  clinicEmail,
  clinicPhone,
  rebookUrl,
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
                  <strong>Người hủy lịch:</strong> ${canceledBy}<br>
                  <strong>Lý do hủy:</strong> ${reason}
                </td>
              </tr>
            </table>

${getContactInfoBlock({ clinicEmail, clinicPhone })}

${getRebookButton({ rebookUrl })}

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

export const getTemplateAdminCanceledPaidAppointmentWithRefund = ({
  fullName,
  doctorName,
  appointmentDate,
  time,
  depositAmount,
  totalAmount,
  roomName,
  location,
  reason,
  canceledBy,
  clinicEmail,
  clinicPhone,
  rebookUrl,
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

            <p style="margin:0 0 16px;">
              Khoản tiền cọc của bạn đã được chuyển sang trạng thái <strong>chờ hoàn tiền</strong>.
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
                  <strong>Người hủy lịch:</strong> ${canceledBy}<br>
                  <strong>Lý do/Ghi chú từ phòng khám:</strong> ${reason}
                </td>
              </tr>
            </table>

${getContactInfoBlock({ clinicEmail, clinicPhone })}

${getRebookButton({ rebookUrl })}

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

export const getTemplateAdminCanceledPaidAppointmentNoRefund = ({
  fullName,
  doctorName,
  appointmentDate,
  time,
  depositAmount,
  totalAmount,
  roomName,
  location,
  reason,
  canceledBy,
  clinicEmail,
  clinicPhone,
  rebookUrl,
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

            <p style="margin:0 0 16px;">
              Theo chính sách hiện tại, khoản tiền cọc của lịch hẹn này <strong>không được hoàn lại</strong>.
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
                  <strong>Người hủy lịch:</strong> ${canceledBy}<br>
                  <strong>Lý do/Ghi chú từ phòng khám:</strong> ${reason}
                </td>
              </tr>
            </table>

${getContactInfoBlock({ clinicEmail, clinicPhone })}

${getRebookButton({ rebookUrl })}

            <p style="margin:0 0 16px;">
              Nếu cần hỗ trợ thêm, vui lòng liên hệ với phòng khám.
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
