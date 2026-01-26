import mongoose,{Schema} from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

  email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",  
    },
   

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
    },

    experience_year: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor
