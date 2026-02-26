import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // ✅ dùng Doctor model
      required: true,
    },

    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    dateTime: Date,
    time: String,

    room: {
      id: Number,
      name: String,
    },

    payment: {
      totalAmount: {
        type: Number,
        default: 0,
      },
      paymentMethod: {
        type: String,
        default: "CASH",
      },
      paymentStatus: {
        type: String,
        default: "UNPAID",
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
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
