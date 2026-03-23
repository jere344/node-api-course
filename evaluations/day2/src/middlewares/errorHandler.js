function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Erreur interne";

  if (req.app.get("env") !== "production") {
    return res.status(status).json({ error: message });
  }

  return res.status(status).json({ error: status === 500 ? "Erreur interne" : message });
}

module.exports = errorHandler;
