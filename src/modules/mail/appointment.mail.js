import {
  getTemplateAdminCanceledPaidAppointment,
  getTemplateAppointmentDepositPaid,
  getTemplateAppointmentPaidCanceled,
} from "./mail.template.js";
import { sendMail } from "./sendMail.js";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const getPatientName = (appointment) => {
  return (
    appointment?.patientProfile?.fullName ||
    appointment?.patient?.fullName ||
    "Khách hàng"
  );
};

const getPatientEmail = (appointment) => {
  return (
    appointment?.patient?.email || appointment?.patientProfile?.email || ""
  );
};

const getDoctorName = (appointment) => {
  return appointment?.doctor?.name || "Bác sĩ Luxury Eyes";
};

const formatAppointmentDate = (dateTime) => {
  if (!dateTime) return "Chưa cập nhật";

  const normalizedDate = new Date(dateTime);
  if (Number.isNaN(normalizedDate.getTime())) {
    return "Chưa cập nhật";
  }

  return normalizedDate.toLocaleDateString("vi-VN");
};

const getRoomName = (room) => {
  if (!room) return "Chưa cập nhật";
  if (room.name) return room.name;
  if (room.id !== undefined && room.id !== null) return `Phong ${room.id}`;
  return "Chưa cập nhật";
};

export const sendAppointmentDepositPaidEmail = async (appointment) => {
  const to = getPatientEmail(appointment);
  if (!to) return;

  await sendMail({
    to,
    subject: "Luxury Eyes - Thanh toán tiền cọc thành công",
    html: getTemplateAppointmentDepositPaid({
      fullName: getPatientName(appointment),
      doctorName: getDoctorName(appointment),
      appointmentDate: formatAppointmentDate(appointment?.dateTime),
      time: appointment?.time || "Chưa cập nhật",
      depositAmount: currencyFormatter.format(
        Number(appointment?.payment?.depositAmount || 0),
      ),
      totalAmount: currencyFormatter.format(
        Number(appointment?.payment?.totalAmount || 0),
      ),
      roomName: getRoomName(appointment?.room),
      location: appointment?.location || "Luxury Eyes Clinic",
      txnRef: appointment?.payment?.txnRef || "Chưa cập nhật",
    }),
  });
};

export const sendAppointmentPaidCanceledEmail = async (appointment) => {
  const to = getPatientEmail(appointment);
  if (!to) return;

  await sendMail({
    to,
    subject: "Luxury Eyes - Thông báo hủy lịch đã thanh toán",
    html: getTemplateAppointmentPaidCanceled({
      fullName: getPatientName(appointment),
      doctorName: getDoctorName(appointment),
      appointmentDate: formatAppointmentDate(appointment?.dateTime),
      time: appointment?.time || "Chưa cập nhật",
      depositAmount: currencyFormatter.format(
        Number(appointment?.payment?.depositAmount || 0),
      ),
      totalAmount: currencyFormatter.format(
        Number(appointment?.payment?.totalAmount || 0),
      ),
      roomName: getRoomName(appointment?.room),
      location: appointment?.location || "Luxury Eyes Clinic",
      reason: appointment?.reason || "Người dùng hủy lịch",
    }),
  });
};

export const sendAdminCanceledPaidAppointmentEmail = async (appointment) => {
  const to = appointment?.patient?.email || "";
  if (!to) return;

  await sendMail({
    to,
    subject: "Luxury Eyes - Phòng khám đã hủy lịch hẹn của bạn",
    html: getTemplateAdminCanceledPaidAppointment({
      fullName: getPatientName(appointment),
      doctorName: getDoctorName(appointment),
      appointmentDate: formatAppointmentDate(appointment?.dateTime),
      time: appointment?.time || "Chưa cập nhật",
      depositAmount: currencyFormatter.format(
        Number(appointment?.payment?.depositAmount || 0),
      ),
      totalAmount: currencyFormatter.format(
        Number(appointment?.payment?.totalAmount || 0),
      ),
      roomName: getRoomName(appointment?.room),
      location: appointment?.location || "Luxury Eyes Clinic",
      reason: appointment?.reason || "Phòng khám thay đổi lịch làm việc",
    }),
  });
};
