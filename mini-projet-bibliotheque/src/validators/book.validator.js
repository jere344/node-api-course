const { z } = require("zod");

const currentYear = new Date().getFullYear() + 1;

const createBookSchema = z
  .object({
    titre: z.string().trim().min(1, "titre est obligatoire"),
    auteur: z.string().trim().min(1, "auteur est obligatoire"),
    annee: z
      .preprocess((value) => {
        if (value === undefined || value === null || value === "") {
          return undefined;
        }

        return Number(value);
      }, z.number().int("annee doit etre un entier").min(0).max(currentYear).optional())
      .optional()
  })
  .strict();

module.exports = {
  createBookSchema
};
