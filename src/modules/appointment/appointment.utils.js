/**
 * Chuyển đổi giá trị query string (đơn lẻ hoặc mảng, có thể phân cách bằng dấu phẩy)
 * thành một mảng các chuỗi đã được trim và loại bỏ giá trị rỗng.
 *
 * Ví dụ: "PENDING,CONFIRM" → ["PENDING", "CONFIRM"]
 *        ["PENDING", "CONFIRM,DONE"] → ["PENDING", "CONFIRM", "DONE"]
 */
export const toArrayQueryValue = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Escape các ký tự đặc biệt trong chuỗi để dùng an toàn trong RegExp.
 * Ngăn chặn injection pattern khi tìm kiếm động bằng regex.
 */
export const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Trả về ngày đầu tiên của tháng hiện tại lúc 00:00:00.000.
 * Dùng để xác định phạm vi tính số lần hủy lịch trong tháng.
 */
export const startOfCurrentMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Kiểm tra chuỗi có đúng định dạng MongoDB ObjectId (24 ký tự hex) không.
 */
export const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));
