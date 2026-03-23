require("dotenv").config();

const express = require("express");
const prisma = require("./prisma");
const { ensureSeedData } = require("./db");
const { validateSchema } = require("./middlewares/validateSchema");
const { createBookSchema } = require("./validators/book.validator");
const { findAll, findById, create } = require("./bookModel");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/bibliotheque", async (req, res) => {
  const livres = await findAll();
  res.status(200).json(livres);
});

app.get("/bibliotheque/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "id invalide" });
  }

  const livre = await findById(id);

  if (!livre) {
    return res.status(404).json({ message: "Livre non trouve" });
  }

  return res.status(200).json(livre);
});

app.post("/bibliotheque", validateSchema(createBookSchema), async (req, res) => {
  const { titre, auteur, annee } = req.validatedBody;

  const livreCree = await create({
    titre,
    auteur,
    annee: annee ?? null
  });

  return res.status(201).json(livreCree);
});

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
