const authService = require("../services/authService");

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.userId);
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = authController;
