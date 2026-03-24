function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return res.status(400).json({
        error: "Donnees invalides",
        details
      });
    }

    req.body = result.data;
    return next();
  };
}

module.exports = validate;
