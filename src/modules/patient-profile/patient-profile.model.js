import mongoose, { Schema } from "mongoose";

const patientProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    identityCard: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

patientProfileSchema.index({ userId: 1 });
patientProfileSchema.index({ phone: 1 });
patientProfileSchema.index({ identityCard: 1 }, { sparse: true });

const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);

export default PatientProfile;
