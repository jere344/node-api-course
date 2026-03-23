const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const { generateToken } = require("../utils/jwt");

class AuthService {
  async register(data) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      const error = new Error("Cet email est deja utilise");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        email: data.email,
        password: hashedPassword,
        role: "user"
      },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  async login(data) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      const error = new Error("Identifiant ou mot de passe incorrect");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      const error = new Error("Identifiant ou mot de passe incorrect");
      error.status = 401;
      throw error;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async me(userId) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      const error = new Error("Utilisateur introuvable");
      error.status = 404;
      throw error;
    }

    return user;
  }
}

module.exports = new AuthService();
