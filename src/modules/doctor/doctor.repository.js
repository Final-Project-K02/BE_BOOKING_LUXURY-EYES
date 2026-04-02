import Appointment from "../appointment/appointment.js";
import DoctorSchedule from "../schedule/doctorSchedule.js";
import { queryWithFilters } from "../../shared/utils/appointmentQueryBuilder.js";
import Doctor from "./doctor.js";

export const createDoctor = (data) => Doctor.create(data);

export const findDoctorById = (id) => Doctor.findById(id);

export const updateDoctorById = (id, data) =>
  Doctor.findByIdAndUpdate(id, data, { new: true });

export const saveDoctorDoc = (doctor) => doctor.save();

export const deleteDoctorDoc = (doctor) => doctor.deleteOne();

export const findDoctorsWithPagination = (filters, options) =>
  queryWithFilters(Doctor, { filters, ...options });

export const findAllDoctors = (filter) =>
  Doctor.find(filter).sort({ createdAt: -1 });

export const getDoctorIdsWithAvailableSchedule = (dateCond) => {
  const scheduleFilter = {
    timeSlots: {
      $elemMatch: {
        date: dateCond,
        status: "AVAILABLE",
      },
    },
  };
  return DoctorSchedule.distinct("doctorId", scheduleFilter);
};

export const hasActiveAppointments = (doctorId) =>
  Appointment.exists({
    doctor: doctorId,
    status: { $in: ["PENDING", "CONFIRM", "CHECKIN", "REQUEST-CANCELED"] },
  });
