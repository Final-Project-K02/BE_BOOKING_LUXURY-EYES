import mongoose from "mongoose";
import User from "./user.model.js";
import { RoleEnum } from "../../shared/constant/enum.js";
import { toPublicUser } from "./user.presentor.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users.map(toPublicUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi tải danh sách người dùng",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
      });
    }

    if (!["ACTIVE", "BLOCKED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (status === "BLOCKED" && String(req.user?._id) === String(user._id)) {
      return res.status(400).json({
        success: false,
        message: "Không thể tự khóa chính mình",
      });
    }

    if (
      status === "BLOCKED" &&
      user.role === RoleEnum.ADMIN &&
      user.is_locked === false
    ) {
      const activeAdminCount = await User.countDocuments({
        role: RoleEnum.ADMIN,
        is_locked: false,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Không thể khóa admin cuối cùng",
        });
      }
    }

    const updatePayload = {
      is_locked: status === "BLOCKED",
      // Revoke current session when account is blocked.
      refreshToken: status === "BLOCKED" ? null : undefined,
    };

    // Remove undefined fields so ACTIVE won't overwrite refreshToken.
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) delete updatePayload[key];
    });

    const updatedUser = await User.findByIdAndUpdate(id, updatePayload, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message:
        status === "BLOCKED"
          ? "Khóa tài khoản thành công"
          : "Mở khóa tài khoản thành công",
      data: toPublicUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Cập nhật trạng thái thất bại",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
      });
    }

    const normalizedRole = String(role || "").toLowerCase();

    const allowedRoles = Object.values(RoleEnum).map((item) =>
      String(item).toLowerCase(),
    );

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: normalizedRole },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật vai trò thành công",
      data: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Cập nhật vai trò thất bại",
    });
  }
};
