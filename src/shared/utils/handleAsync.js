import createError from "./createError.js";

const handleAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    if (err?.statusCode) {
      return createError(res, err.statusCode, err.message);
    }
    createError(res, 500, "Server Error!", err);
    console.log(err);
  });
};

export default handleAsync;
