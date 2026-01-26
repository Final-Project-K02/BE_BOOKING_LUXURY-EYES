// controllers/user.controller.js

import User from "./user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // password bị ẩn do select:false
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
