const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const config = require("./config/env");
const swaggerSpec = require("./docs/swagger");
const authRoutes = require("./routes/auth");
const livresRoutes = require("./routes/livres");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());

if (config.nodeEnv === "production") {
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        if (config.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origine non autorisee par CORS"));
      },
      credentials: true
    })
  );
} else {
  app.use(cors({ origin: true, credentials: true }));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requetes. Reessayez dans 15 minutes." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Reessayez dans 15 minutes." }
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/livres", livresRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
