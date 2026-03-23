const prisma = require("./prisma");

async function findAll() {
  return prisma.livre.findMany({ orderBy: { id: "asc" } });
}

async function findById(id) {
  return prisma.livre.findUnique({ where: { id } });
}

async function create({ titre, auteur, annee }) {
  return prisma.livre.create({
    data: {
      titre,
      auteur,
      annee: annee ?? null
    }
  });
}

module.exports = {
  findAll,
  findById,
  create
};
