import createError from "../../shared/utils/createError.js";
import createResponse from "../../shared/utils/createResponse.js";
import handleAsync from "../../shared/utils/handleAsync.js";
import PatientProfile from "./patient-profile.model.js";

/*
  POST /patient-profiles
*/
export const createPatientProfile = handleAsync(async (req, res) => {
  const userId = req.user.id;

  const profile = await PatientProfile.create({
    ...req.body,
    userId,
  });

  return createResponse(res, 201, "Tạo hồ sơ bệnh nhân thành công", profile);
});

/*
  GET /patient-profiles
*/
export const getMyPatientProfiles = handleAsync(async (req, res) => {
  const userId = req.user.id;

  const profiles = await PatientProfile.find({ userId }).sort({
    createdAt: -1,
  });

  return createResponse(res, 200, "Lấy danh sách hồ sơ thành công", profiles);
});

/*
  GET /patient-profiles/:id
*/
export const getPatientProfileById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const profile = await PatientProfile.findOne({
    _id: id,
    userId,
  });

  if (!profile) return createError(res, 404, "Không tìm thấy hồ sơ bệnh nhân");

  return createResponse(res, 200, "Lấy hồ sơ thành công", profile);
});

/*
  PATCH /patient-profiles/:id
*/
export const updatePatientProfile = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const profile = await PatientProfile.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true, runValidators: true },
  );

  if (!profile) return createError(res, 404, "Không tìm thấy hồ sơ bệnh nhân");

  return createResponse(res, 200, "Cập nhật hồ sơ thành công", profile);
});

/*
  DELETE /patient-profiles/:id
*/
export const deletePatientProfile = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const profile = await PatientProfile.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!profile) return createError(res, 404, "Không tìm thấy hồ sơ bệnh nhân");

  return createResponse(res, 200, "Xóa hồ sơ thành công");
});
