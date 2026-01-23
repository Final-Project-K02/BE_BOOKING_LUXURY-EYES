import createError from "../utils/createError.js";

export const checkPermission =
  (roles = []) =>
  (req, res, next) => {
    if (!req.user || !req.user.role)
      return createError(res, 401, "Unauthenticated");

    if (!roles.includes(req.user.role))
      return createError(res, 403, "Bạn không có quyền");
    next();
  };
