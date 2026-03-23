const prisma = require("./prisma");

async function ensureSeedData() {
  const total = await prisma.livre.count();

  if (total > 0) {
    return;
  }

  await prisma.livre.createMany({
    data: [
      { titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupery", annee: 1943 },
      { titre: "L'Etranger", auteur: "Albert Camus", annee: 1942 },
      { titre: "Bel-Ami", auteur: "Guy de Maupassant", annee: 1885 }
    ]
  });
}

module.exports = {
  ensureSeedData
};
