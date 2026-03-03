const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Deleting AMM Pools...");
  await prisma.aMMPool.deleteMany();

  console.log("Deleting AMM Markets...");
  await prisma.market.deleteMany({
    where: { engineType: "AMM" }
  });

  console.log("Done.");
  process.exit(0);
}

cleanup();