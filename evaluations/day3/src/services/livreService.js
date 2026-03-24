const prisma = require("../db/prisma");

function buildNotFoundError(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function parseIdOrThrow(value, fieldName = "id") {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} invalide`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

function pickDefinedLivreFields(data) {
  const fields = ["titre", "auteur", "annee", "genre", "disponible"];
  const payload = {};

  for (const field of fields) {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
  }

  return payload;
}

class LivreService {
  async findAll() {
    return prisma.livre.findMany({ orderBy: { id: "asc" } });
  }

  async findById(id) {
    const parsedId = parseIdOrThrow(id, "id");
    const livre = await prisma.livre.findUnique({ where: { id: parsedId } });

    if (!livre) {
      throw buildNotFoundError("Livre introuvable");
    }

    return livre;
  }

  async create(data) {
    return prisma.livre.create({ data: pickDefinedLivreFields(data) });
  }

  async update(id, data) {
    const parsedId = parseIdOrThrow(id, "id");
    await this.findById(parsedId);

    return prisma.livre.update({
      where: { id: parsedId },
      data: pickDefinedLivreFields(data)
    });
  }

  async delete(id) {
    const parsedId = parseIdOrThrow(id, "id");
    await this.findById(parsedId);
    await prisma.livre.delete({ where: { id: parsedId } });
  }

  async emprunter(livreId, userId) {
    const parsedLivreId = parseIdOrThrow(livreId, "livreId");
    const parsedUserId = parseIdOrThrow(userId, "userId");
    const livre = await this.findById(parsedLivreId);

    if (!livre.disponible) {
      const error = new Error("Ce livre n'est pas disponible");
      error.status = 409;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      await tx.livre.update({
        where: { id: parsedLivreId },
        data: { disponible: false }
      });

      return tx.emprunt.create({
        data: {
          livreId: parsedLivreId,
          userId: parsedUserId
        }
      });
    });
  }

  async retourner(livreId, userId) {
    const parsedLivreId = parseIdOrThrow(livreId, "livreId");
    const parsedUserId = parseIdOrThrow(userId, "userId");

    const activeLoan = await prisma.emprunt.findFirst({
      where: {
        livreId: parsedLivreId,
        userId: parsedUserId,
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
        where: { id: parsedLivreId },
        data: { disponible: true }
      });

      return emprunt;
    });
  }
}

module.exports = new LivreService();
