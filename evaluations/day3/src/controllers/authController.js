const authService = require("../services/authService");

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      return res.status(201).json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      return next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
      return res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      return next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const accessToken = await authService.refresh(refreshToken);
      return res.json({ accessToken });
    } catch (error) {
      return next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });
      return res.json({ message: "Deconnecte" });
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
