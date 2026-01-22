export const toPublicUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  email: user.email,
  role: user.role,
});
