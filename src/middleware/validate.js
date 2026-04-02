export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const formattedErrors = {};

    result.error.issues.forEach((issue) => {
      // Ví dụ path: ['body', 'name'] hoặc ['params', 'id']
      const field = issue.path.slice(1).join(".");
      formattedErrors[field] = issue.message;
    });

    return res.status(422).json({
      message: "Validation error",
      errors: formattedErrors,
    });
  }

  next();
};
