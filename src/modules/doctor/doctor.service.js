import * as doctorRepo from "./doctor.repository.js";
import AppError from "../../shared/utils/AppError.js";

const PAGE_LIMIT = 5;

export const createDoctor = (body) => doctorRepo.createDoctor(body);

export const getDoctors = async (query) => {
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
  } = query;

  const pageNum = parseInt(page, 10) || 1;

  const filters = { is_active: true };

  if (minPrice) filters.priceMin = minPrice;
  if (maxPrice) filters.priceMax = maxPrice;
  if (experience_year) filters.experience_yearMin = experience_year;
  if (createdAtFrom) filters.createdAtFrom = createdAtFrom;
  if (createdAtTo) filters.createdAtTo = createdAtTo;

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

    const doctorIds =
      await doctorRepo.getDoctorIdsWithAvailableSchedule(dateCond);

    if (!doctorIds.length) {
      return {
        data: [],
        meta: { total: 0, page: pageNum, limit: PAGE_LIMIT, totalPages: 0 },
      };
    }

    filters._id = { $in: doctorIds };
  }

  return doctorRepo.findDoctorsWithPagination(filters, {
    search: keyword,
    searchFields: ["name"],
    sort: "createdAt",
    order: "desc",
    page: pageNum,
    limit: PAGE_LIMIT,
  });
};

export const getDoctorById = async (id) => {
  const doctor = await doctorRepo.findDoctorById(id);
  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }
  return doctor;
};

export const updateDoctor = async (id, body) => {
  const doctor = await doctorRepo.updateDoctorById(id, body);
  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }
  return doctor;
};

export const deleteDoctor = async (id) => {
  const doctor = await doctorRepo.findDoctorById(id);
  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  if (doctor.is_active) {
    throw new AppError(400, "Phải tắt bác sĩ trước khi xoá");
  }

  const hasAppointment = await doctorRepo.hasActiveAppointments(doctor._id);
  if (hasAppointment) {
    throw new AppError(400, "Bác sĩ vẫn còn lịch khám, không thể xoá");
  }

  await doctorRepo.deleteDoctorDoc(doctor);
};

export const toggleDoctorStatus = async (id) => {
  const doctor = await doctorRepo.findDoctorById(id);
  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  if (doctor.is_active) {
    const hasAppointment = await doctorRepo.hasActiveAppointments(doctor._id);
    if (hasAppointment) {
      throw new AppError(400, "Bác sĩ còn lịch khám, không thể tắt");
    }
    doctor.is_active = false;
  } else {
    doctor.is_active = true;
  }

  await doctorRepo.saveDoctorDoc(doctor);
  return doctor;
};

export const getDoctorsByAdmin = (query) => {
  const { keyword, minPrice, maxPrice, experience_year } = query;

  const filter = {};

  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" };
  }

  if (experience_year) {
    filter.experience_year = { $gte: Number(experience_year) };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return doctorRepo.findAllDoctors(filter);
};

export const updateDoctorAvatar = async (id, avatar) => {
  const doctor = await doctorRepo.findDoctorById(id);
  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  doctor.avatar = avatar;
  await doctorRepo.saveDoctorDoc(doctor);
  return doctor;
};
