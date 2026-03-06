import crypto from "crypto";

export const formatVnpDate = (date = new Date()) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const sortObject = (obj = {}) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = obj[key];
  }

  return sorted;
};

export const buildQuery = (params = {}) => {
  const sorted = sortObject(params);

  return Object.keys(sorted)
    .map((key) => {
      const value = sorted[key] ?? "";
      return (
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(String(value)).replace(/%20/g, "+")
      );
    })
    .join("&");
};

export const createSecureHash = (params = {}, secretKey) => {
  if (!secretKey) {
    throw new Error("VNPAY_HASH_SECRET is missing");
  }

  const signData = buildQuery(params);

  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
};

export const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];

  let ip =
    (Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(",")[0]?.trim()) ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    "127.0.0.1";

  if (ip === "::1") ip = "127.0.0.1";
  if (typeof ip === "string" && ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;
};