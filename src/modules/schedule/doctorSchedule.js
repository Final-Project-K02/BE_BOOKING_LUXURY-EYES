import mongoose, { Schema } from "mongoose";

const timeSlotSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // "07:30"
      required: true,
    },
    blockTime: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED"],
      default: "AVAILABLE",
    },
    capacity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const doctorScheduleSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    roomId: {
      type: Number,
      required: true,
    },

    roomName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    timeSlots: {
      type: [timeSlotSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  doctorScheduleSchema
);

export default DoctorSchedule;
