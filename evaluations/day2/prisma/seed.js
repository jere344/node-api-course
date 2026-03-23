const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@biblio.dev" },
    update: {},
    create: {
      nom: "Admin",
      email: "admin@biblio.dev",
      password: adminPassword,
      role: "admin"
    }
  });

  const livres = [
    { titre: "Node.js en action", auteur: "Mike Cantelon", genre: "Informatique" },
    { titre: "Clean Code", auteur: "Robert C. Martin", genre: "Informatique" }
  ];

  for (const livre of livres) {
    await prisma.livre.create({ data: livre });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
