import {
  buildDoctorQuery,
  queryWithFilters,
} from "../../shared/utils/appointmentQueryBuilder.js";
import Appointment from "../appointment/appointment.js";
import DoctorSchedule from "../schedule/doctorSchedule.js";

import Doctor from "./doctor.js";
import createResponse from "../../shared/utils/createResponse.js";

export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      message: "Create doctor successfully",
      data: doctor,
    });
  } catch (error) {
    return createResponse(res, 400, error.message || "Create doctor failed");
  }
};

export const getDoctors = async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      experience_year,
      scheduleDateFrom,
      scheduleDateTo,
      createdAtFrom,
      createdAtTo,
      page = 1,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = 5;

    const filters = {
      is_active: true,
    };

    if (minPrice) {
      filters.priceMin = minPrice;
    }

    if (maxPrice) {
      filters.priceMax = maxPrice;
    }

    if (experience_year) {
      filters.experience_yearMin = experience_year;
    }

    if (createdAtFrom) {
      filters.createdAtFrom = createdAtFrom;
    }

    if (createdAtTo) {
      filters.createdAtTo = createdAtTo;
    }

    if (scheduleDateFrom || scheduleDateTo) {
      const dateCond = {};

      if (scheduleDateFrom) {
        const start = new Date(scheduleDateFrom);
        start.setHours(0, 0, 0, 0);
        dateCond.$gte = start;
      }

      if (scheduleDateTo) {
        const end = new Date(scheduleDateTo);
        end.setHours(23, 59, 59, 999);
        dateCond.$lte = end;
      }

      const scheduleFilter = {
        timeSlots: {
          $elemMatch: {
            date: dateCond,
            status: "AVAILABLE",
          },
        },
      };

      const doctorIds = await DoctorSchedule.distinct(
        "doctorId",
        scheduleFilter,
      );

      if (!doctorIds.length) {
        return res.status(200).json({
          data: [],
          meta: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
          },
        });
      }

      filters._id = { $in: doctorIds };
    }

    const result = await queryWithFilters(Doctor, {
      filters,
      search: keyword,
      searchFields: ["name"],
      sort: "createdAt",
      order: "desc",
      page: pageNum,
      limit: limitNum,
    });

    return res.status(200).json(result);
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
    if (error && error.name === "CastError") {
      return res.status(400).json({
        message: "Validation error",
        errors: { id: "Doctor id không hợp lệ" },
      });
    }

    return res.status(400).json({
      message: error.message || "Invalid doctor id",
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

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
    if (error && error.name === "CastError") {
      return res.status(400).json({
        message: "Validation error",
        errors: { id: "Doctor id không hợp lệ" },
      });
    }

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
      status: { $in: ["PENDING", "CONFIRM", "CHECKIN", "REQUEST-CANCELED"] },
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
    if (error && error.name === "CastError") {
      return res.status(400).json({
        message: "Validation error",
        errors: { id: "Doctor id không hợp lệ" },
      });
    }

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
        status: { $in: ["PENDING", "CONFIRM", "CHECKIN", "REQUEST-CANCELED"] },
      });

      if (hasAppointment) {
        return res.status(400).json({
          message: "Bác sĩ còn lịch khám, không thể tắt",
        });
      }

      doctor.is_active = false;
    } else {
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
    const { keyword, minPrice, maxPrice, experience_year } = req.query;

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

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });

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


export const updateDoctorAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    if (!avatar || typeof avatar !== "string") {
      return res.status(400).json({ message: "avatar is required" });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.avatar = avatar;
    await doctor.save();

    return res.status(200).json({
      message: "Cập nhật avatar thành công",
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Update failed" });
  }
};