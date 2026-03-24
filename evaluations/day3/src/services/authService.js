const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const prisma = require("../db/prisma");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require("../utils/jwt");

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toPublicUser(user) {
  return {
    id: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function buildUnauthorizedError() {
  const error = new Error("Identifiants invalides");
  error.status = 401;
  return error;
}

class AuthService {
  async register(data) {
    const { nom, email, password } = data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      const error = new Error("Cet email est deja utilise");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        nom,
        email,
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

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      jti: randomUUID()
    });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
      }
    });

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken
    };
  }

  async login(data) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw buildUnauthorizedError();
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      jti: randomUUID()
    });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
      }
    });

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error("Refresh token invalide ou expire");
      error.status = 401;
      throw error;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      const error = new Error("Refresh token invalide ou expire");
      error.status = 401;
      throw error;
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (_error) {
      const error = new Error("Refresh token invalide ou expire");
      error.status = 401;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      select: { id: true, role: true }
    });

    if (!user) {
      const error = new Error("Refresh token invalide ou expire");
      error.status = 401;
      throw error;
    }

    return generateAccessToken({ userId: user.id, role: user.role });
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
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
