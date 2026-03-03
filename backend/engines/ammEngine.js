const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function processAMMTrade({
  userId,
  marketId,
  outcome,
  quantity
}) {
  quantity = parseFloat(quantity);

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new Error("User not found");

  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: { ammPool: true }   // ⚠ Make sure name matches schema
  });

  if (!market) throw new Error("Market not found");
  if (!market.ammPool) throw new Error("AMM Pool not initialized");

  let { yesShares, noShares } = market.ammPool;

  const k = yesShares * noShares;

  let cost = 0;

  if (outcome === "YES") {
    const newYes = yesShares - quantity;
    if (newYes <= 0) throw new Error("Not enough YES liquidity");

    const newNo = k / newYes;
    cost = newNo - noShares;

    yesShares = newYes;
    noShares = newNo;
  }

  if (outcome === "NO") {
    const newNo = noShares - quantity;
    if (newNo <= 0) throw new Error("Not enough NO liquidity");

    const newYes = k / newNo;
    cost = newYes - yesShares;

    noShares = newNo;
    yesShares = newYes;
  }

  if (cost > user.balance) {
    throw new Error("Insufficient balance");
  }

  // Deduct balance
  await prisma.user.update({
    where: { id: userId },
    data: {
      balance: { decrement: cost }
    }
  });

  // Update pool
  await prisma.aMMPool.update({
    where: { id: market.ammPool.id },
    data: {
      yesShares,
      noShares
    }
  });

  // Update position
  const existing = await prisma.position.findFirst({
    where: { userId, marketId }
  });

  if (existing) {
    await prisma.position.update({
      where: { id: existing.id },
      data: {
        [outcome.toLowerCase() + "Shares"]: {
          increment: quantity
        }
      }
    });
  } else {
    await prisma.position.create({
      data: {
        userId,
        marketId,
        yesShares: outcome === "YES" ? quantity : 0,
        noShares: outcome === "NO" ? quantity : 0
      }
    });
  }

  return { success: true, cost };
}

module.exports = { processAMMTrade };