import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    dateTime: {
      type: Date,
      required: true,
    },

    time: {
      type: String, // "08:00"
      required: true,
    },

    room: {
      id: Number,
      name: String,
    },

    payment: {
      paymentStatus: {
        type: String,
        enum: ["UNPAID", "PAID"],
        default: "UNPAID",
      },
      method: String,
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
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Appointment", appointmentSchema);
