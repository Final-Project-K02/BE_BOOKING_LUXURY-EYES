import {
  createSecureHash,
  buildQuery,
  formatVnpDate,
} from "../../shared/utils/vnpay.util.js";

// ─── Sinh mã giao dịch ────────────────────────────────────────────────────

/**
 * Sinh mã txnRef duy nhất cho mỗi giao dịch VNPay.
 * Định dạng: APT{timestamp}{random 3 chữ số}
 */
export const generateTxnRef = () =>
  `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

// ─── Kiểm tra cấu hình môi trường ────────────────────────────────────────

/**
 * Kiểm tra các biến môi trường bắt buộc của VNPay.
 * Ném lỗi với thông báo rõ ràng nếu thiếu config.
 */
export const validateVnpayConfig = () => {
  const required = {
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET,
    VNPAY_URL: process.env.VNPAY_URL,
    VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) throw new Error(`Thiếu cấu hình ${key}`);
  }
};

// ─── Xác thực chữ ký từ callback ─────────────────────────────────────────

/**
 * Xác thực chữ ký HMAC-SHA512 từ callback của VNPay.
 * Trả về { isValid, inputData } — inputData đã loại bỏ các field SecureHash.
 */
export const verifyVnpaySignature = (queryParams) => {
  const inputData = { ...queryParams };
  const receivedHash = inputData.vnp_SecureHash;

  delete inputData.vnp_SecureHash;
  delete inputData.vnp_SecureHashType;

  const signed = createSecureHash(inputData, process.env.VNPAY_HASH_SECRET);

  return { isValid: signed === receivedHash, inputData };
};

// ─── Tạo URL thanh toán ───────────────────────────────────────────────────

/**
 * Xây dựng URL thanh toán VNPay từ thông tin giao dịch.
 *
 * @param {string} txnRef         - Mã giao dịch duy nhất
 * @param {number} depositAmount  - Số tiền cọc (VND)
 * @param {string} appointmentId  - ID lịch hẹn
 * @param {Date}   expireAt       - Thời điểm hết hạn giao dịch
 * @param {string} ipAddr         - IP của client
 */
export const buildVnpayPaymentUrl = ({
  txnRef,
  depositAmount,
  appointmentId,
  expireAt,
  ipAddr,
}) => {
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_Amount: depositAmount * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `DAT COC LICH KHAM ${appointmentId}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: formatVnpDate(new Date()),
    vnp_ExpireDate: formatVnpDate(expireAt),
  };

  const secureHash = createSecureHash(vnpParams, process.env.VNPAY_HASH_SECRET);
  const query = buildQuery(vnpParams);

  return `${process.env.VNPAY_URL}?${query}&vnp_SecureHash=${secureHash}`;
};
