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
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    return res.status(200).json({
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
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
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      message: "Delete doctor successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid doctor id",
    });
  }
};
