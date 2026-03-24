require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const { body, param, validationResult } = require("express-validator");
const prisma = require("./prisma");
const { ensureSeedData } = require("./db");
const swaggerSpec = require("./docs/swagger");
const { validateSchema } = require("./middlewares/validateSchema");
const { createBookSchema } = require("./validators/book.validator");
const { findAll, findById, create } = require("./bookModel");

const app = express();
const port = Number(process.env.PORT) || 3000;

const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const createLimiter = (max, error, extra = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error },
    ...extra
  });

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Requete invalide",
      errors: errors.array({ onlyFirstError: true })
    });
  }

  next();
};

app.use(helmet());

app.use(
  cors(
    isProd
      ? {
          origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error(`CORS: origine non autorisee - ${origin}`));
          }
        }
      : {}
  )
);

app.use(
  createLimiter(100, "Trop de requetes. Reessayez dans 15 minutes.")
);

const authLimiter = createLimiter(
  5,
  "Trop de tentatives. Reessayez dans 15 minutes.",
  { skipSuccessfulRequests: true }
);

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /bibliotheque:
 *   get:
 *     summary: Liste les livres
 *     tags: [Bibliotheque]
 *     responses:
 *       200:
 *         description: Liste des livres
 */
app.get("/bibliotheque", async (req, res) => {
  const livres = await findAll();
  res.status(200).json(livres);
});

/**
 * @swagger
 * /bibliotheque/{id}:
 *   get:
 *     summary: Recupere un livre par id
 *     tags: [Bibliotheque]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livre trouve
 *       404:
 *         description: Livre non trouve
 */
app.get(
  "/bibliotheque/:id",
  param("id").isInt({ min: 1 }).withMessage("id invalide").toInt(),
  handleValidationErrors,
  async (req, res) => {
    const id = req.params.id;

    const livre = await findById(id);

    if (!livre) {
      return res.status(404).json({ message: "Livre non trouve" });
    }

    return res.status(200).json(livre);
  }
);

/**
 * @swagger
 * /bibliotheque:
 *   post:
 *     summary: Cree un livre
 *     tags: [Bibliotheque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, auteur]
 *             properties:
 *               titre:
 *                 type: string
 *               auteur:
 *                 type: string
 *               annee:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Livre cree
 */
app.post(
  "/bibliotheque",
  body("titre").trim().escape(),
  body("auteur").trim().escape(),
  handleValidationErrors,
  validateSchema(createBookSchema),
  async (req, res) => {
    const { titre, auteur, annee } = req.validatedBody;

    const livreCree = await create({
      titre,
      auteur,
      annee: annee ?? null
    });

    return res.status(201).json(livreCree);
  }
);

async function startServer() {
  await ensureSeedData();

  app.listen(port, () => {
    console.log(`Serveur demarre sur http://localhost:${port}`);
  });
}

startServer().catch(async (error) => {
  console.error("Erreur au demarrage du serveur:", error);
  await prisma.$disconnect();
  process.exit(1);
});
