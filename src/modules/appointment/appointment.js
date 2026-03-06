import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    dateTime: Date,
    time: String,

    location: {
      type: String,
      default: "",
    },

    symptoms: {
      type: String,
      default: "",
    },

    room: {
      id: Number,
      name: String,
    },

    payment: {
      totalAmount: {
        type: Number,
        required: true,
        default: 0,
      },
      depositRate: {
        type: Number,
        default: 40,
      },
      depositAmount: {
        type: Number,
        default: 0,
      },
      paymentMethod: {
        type: String,
        enum: ["CASH", "VNPAY", "PAY_AT_CLINIC"],
        default: "CASH",
      },
      paymentStatus: {
        type: String,
        enum: ["UNPAID", "PENDING", "PAID", "FAILED", "EXPIRED"],
        default: "UNPAID",
      },
      txnRef: {
        type: String,
      },
      vnpTransactionNo: {
        type: String,
      },
      paidAt: {
        type: Date,
        default: null,
      },
      expireAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRM",
        "CHECKIN",
        "DONE",
        "CANCELED",
        "REQUEST-CANCELED",
      ],
      default: "PENDING",
    },

    reason: String,
  },
  { timestamps: true }
);

// Chỉ unique khi txnRef là string thật sự
appointmentSchema.index(
  { "payment.txnRef": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "payment.txnRef": { $type: "string" },
    },
  }
);

export default mongoose.model("Appointment", appointmentSchema);