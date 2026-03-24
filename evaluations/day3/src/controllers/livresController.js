const livreService = require("../services/livreService");

const livreController = {
  async index(req, res, next) {
    try {
      const livres = await livreService.findAll();
      return res.json(livres);
    } catch (error) {
      return next(error);
    }
  },

  async show(req, res, next) {
    try {
      const livre = await livreService.findById(req.params.id);
      return res.json(livre);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { titre, auteur, annee, genre, disponible } = req.body;
      const livre = await livreService.create({ titre, auteur, annee, genre, disponible });
      return res.status(201).json(livre);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { titre, auteur, annee, genre, disponible } = req.body;
      const livre = await livreService.update(req.params.id, {
        titre,
        auteur,
        annee,
        genre,
        disponible
      });
      return res.json(livre);
    } catch (error) {
      return next(error);
    }
  },

  async destroy(req, res, next) {
    try {
      await livreService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  async emprunter(req, res, next) {
    try {
      const emprunt = await livreService.emprunter(req.params.id, req.user.userId);
      return res.status(201).json(emprunt);
    } catch (error) {
      return next(error);
    }
  },

  async retourner(req, res, next) {
    try {
      const emprunt = await livreService.retourner(req.params.id, req.user.userId);
      return res.json(emprunt);
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = livreController;
