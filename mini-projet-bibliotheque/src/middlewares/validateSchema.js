function validateSchema(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }));

      return res.status(400).json({
        message: "Payload invalide",
        errors
      });
    }

    req.validatedBody = result.data;
    return next();
  };
}

module.exports = {
  validateSchema
};
