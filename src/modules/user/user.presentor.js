export const toPublicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: String(user.role || "").toUpperCase(),
  status: user.is_locked ? "BLOCKED" : "ACTIVE",
  avatar: user.avatar || "",
  is_locked: !!user.is_locked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});