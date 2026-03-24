const app = require("./app");
const config = require("./config/env");
const prisma = require("./db/prisma");

app.listen(config.port, () => {
  console.log(`Serveur demarre sur le port ${config.port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
