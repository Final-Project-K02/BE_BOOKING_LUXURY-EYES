// Các trạng thái lịch hẹn được coi là "đang hoạt động" (chưa kết thúc)
// Dùng để kiểm tra trùng khung giờ khi đặt lịch mới
export const ACTIVE_APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "REQUEST-CANCELED",
];

// Các trạng thái hợp lệ khi lọc danh sách lịch hẹn qua query
export const FILTERABLE_APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "CANCELED",
];

// Luồng chuyển đổi trạng thái lịch hẹn
// Key: trạng thái hiện tại — Value: các trạng thái được phép chuyển sang
export const STATUS_FLOW = {
  PENDING: ["CONFIRM", "CANCELED"],
  CONFIRM: ["CHECKIN", "CANCELED"],
  CHECKIN: ["DONE", "CANCELED"],
  DONE: [],
  CANCELED: [],
  "REQUEST-CANCELED": ["CANCELED"],
};

// Luồng chuyển đổi trạng thái thanh toán khi hoàn tiền
// Key: trạng thái thanh toán hiện tại — Value: các trạng thái được phép chuyển sang
export const REFUND_FLOW = {
  PAID: ["REFUND_PENDING", "NO_REFUND"],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
  NO_REFUND: [],
};

// Thông báo tương ứng với từng trạng thái hoàn tiền
export const REFUND_MESSAGES = {
  REFUNDED: "Đã xác nhận hoàn tiền thành công",
  REFUND_PENDING: "Đã chuyển trạng thái chờ hoàn tiền",
  NO_REFUND: "Đã xác nhận hủy không hoàn tiền",
};

// Thông báo hiển thị khi hủy lịch dựa trên trạng thái thanh toán sau hủy
export const CANCEL_PAYMENT_MESSAGES = {
  REFUND_PENDING:
    "Hủy lịch thành công. Lịch đã chuyển sang trạng thái chờ hoàn tiền.",
  NO_REFUND: "Hủy lịch thành công. Tiền cọc sẽ KHÔNG được hoàn lại.",
};

// Giới hạn số lần hủy lịch mỗi tháng của bệnh nhân
export const MONTHLY_CANCEL_LIMIT = 4;
