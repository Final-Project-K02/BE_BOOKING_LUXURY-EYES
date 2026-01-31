import { buildDoctorQuery } from "../../shared/utils/appointmentQueryBuilder.js";
import Appointment from "../appointment/appointment.js";

import Doctor from "./doctor.js";


export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      message: "Create doctor successfully",
      data: doctor,
    });
  } catch (error) {
     return createReponse(res, 400, "Successfully");
  }
};


export const getDoctors = async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      experience_year,
    } = req.query;

    const filter = {
      is_active: true,
    };

    if (keyword) {
      filter.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (experience_year) {
      filter.experience_year = {
        $gte: Number(experience_year),
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    console.log("DOCTOR FILTER:", filter);

    const doctors = await Doctor.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: doctors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    return res.status(200).json({
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid doctor id",
    });
  }
};


export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      message: "Update doctor successfully",
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};



export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.is_active) {
      return res.status(400).json({
        message: "Phải tắt bác sĩ trước khi xoá",
      });
    }

    const hasAppointment = await Appointment.exists({
      doctor: doctor._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (hasAppointment) {
      return res.status(400).json({
        message: "Bác sĩ vẫn còn lịch khám, không thể xoá",
      });
    }

    await doctor.deleteOne();

    return res.status(200).json({
      message: "Delete doctor successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};



export const toggleDoctorStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 🔴 BẬT → TẮT
    if (doctor.is_active) {
      const hasAppointment = await Appointment.exists({
        doctor: doctor._id,
        status: { $in: ["pending", "confirmed"] },
      });

      if (hasAppointment) {
        return res.status(400).json({
          message: "Bác sĩ còn lịch khám, không thể tắt",
        });
      }

      doctor.is_active = false;
    }
    // 🟢 TẮT → BẬT
    else {
      doctor.is_active = true;
    }

    await doctor.save();

    return res.status(200).json({
      message: doctor.is_active
        ? "Bật bác sĩ thành công"
        : "Tắt bác sĩ thành công",
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};



export const getDoctorsByAdmin = async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      experience_year,
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (experience_year) {
      filter.experience_year = {
        $gte: Number(experience_year),
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    console.log("DOCTOR FILTER:", filter);

    const doctors = await Doctor.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: doctors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};