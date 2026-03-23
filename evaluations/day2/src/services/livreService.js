const prisma = require("../db/prisma");

function buildNotFoundError(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

class LivreService {
  async findAll() {
    return prisma.livre.findMany({ orderBy: { id: "asc" } });
  }

  async findById(id) {
    const livre = await prisma.livre.findUnique({ where: { id: Number(id) } });

    if (!livre) {
      throw buildNotFoundError("Livre introuvable");
    }

    return livre;
  }

  async create(data) {
    return prisma.livre.create({ data });
  }

  async update(id, data) {
    await this.findById(id);

    return prisma.livre.update({
      where: { id: Number(id) },
      data
    });
  }

  async delete(id) {
    await this.findById(id);
    await prisma.livre.delete({ where: { id: Number(id) } });
  }

  async emprunter(livreId, userId) {
    const livre = await this.findById(livreId);

    if (!livre.disponible) {
      const error = new Error("Ce livre n'est pas disponible");
      error.status = 409;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      await tx.livre.update({
        where: { id: Number(livreId) },
        data: { disponible: false }
      });

      return tx.emprunt.create({
        data: {
          livreId: Number(livreId),
          userId: Number(userId)
        }
      });
    });
  }

  async retourner(livreId, userId) {
    const activeLoan = await prisma.emprunt.findFirst({
      where: {
        livreId: Number(livreId),
        userId: Number(userId),
        dateRetour: null
      }
    });

    if (!activeLoan) {
      const error = new Error("Aucun emprunt actif pour ce livre");
      error.status = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const emprunt = await tx.emprunt.update({
        where: { id: activeLoan.id },
        data: { dateRetour: new Date() }
      });

      await tx.livre.update({
        where: { id: Number(livreId) },
        data: { disponible: true }
      });

      return emprunt;
    });
  }
}

module.exports = new LivreService();
