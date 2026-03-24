const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifie" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Non authentifie" });
  }
}

module.exports = authenticate;
