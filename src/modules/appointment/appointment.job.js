import {
  findExpiredPendingAppointments,
  bulkExpireAppointments,
  releaseScheduleSlot,
} from "./appointment.repository.js";

/**
 * Tìm các lịch hẹn PENDING đã hết hạn thanh toán và chuyển sang CANCELED/EXPIRED,
 * đồng thời giải phóng lại slot đã đặt trong lịch làm việc của bác sĩ.
 *
 * Được gọi trước các query danh sách/chi tiết để đảm bảo dữ liệu luôn nhất quán
 * mà không cần một cron process riêng biệt.

 */
export const expirePendingAppointments = async (filter = {}) => {
  const expired = await findExpiredPendingAppointments(filter);
  if (expired.length === 0) return;

  await bulkExpireAppointments(expired.map((item) => item._id));

  await Promise.all(
    expired.map((item) => releaseScheduleSlot(item.scheduleId, item.time)),
  );
};
