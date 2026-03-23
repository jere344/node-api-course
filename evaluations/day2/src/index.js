const express = require("express");
const config = require("./config/env");
const prisma = require("./db/prisma");
const authRoutes = require("./routes/auth");
const livresRoutes = require("./routes/livres");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/livres", livresRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Serveur demarre sur le port ${config.port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
