import mongoose, { Schema } from "mongoose";
import { RoleEnum } from "../../shared/constant/enum.js";

const cancelStatsSchema = new Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: "user",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
    },

    is_locked: {
      type: Boolean,
      default: false,
    },

    cancel_stats: {
      type: cancelStatsSchema,
      default: () => ({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        count: 0,
      }),
    },
    refreshToken: {
      type: String,
    },
    forgotToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ "cancel_stats.year": 1, "cancel_stats.month": 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
