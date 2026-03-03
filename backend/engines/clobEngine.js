const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function processCLOBOrder(orderData) {
  const { userId, marketId, side, outcome, price, quantity } = orderData;

  if (!userId || !marketId || !side || !outcome || !price || !quantity) {
    throw new Error("Missing required fields");
  }

  const parsedPrice = parseFloat(price);
  const parsedQty = parseFloat(quantity);

  // Find opposite orders
  const oppositeSide = side === "BUY" ? "SELL" : "BUY";

  const matchingOrders = await prisma.order.findMany({
    where: {
      marketId,
      outcome,
      side: oppositeSide,
      status: "OPEN"
    },
    orderBy: {
      price: side === "BUY" ? "asc" : "desc"
    }
  });

  let remaining = parsedQty;

  for (const match of matchingOrders) {
    if (remaining <= 0) break;

    const priceCondition =
      side === "BUY"
        ? parsedPrice >= match.price
        : parsedPrice <= match.price;

    if (!priceCondition) continue;

    const tradeQty = Math.min(remaining, match.remainingQuantity);

    // Create trade
    await prisma.trade.create({
        data: {
            marketId,
            buyerId: side === "BUY" ? userId : match.userId,
            sellerId: side === "SELL" ? userId : match.userId,
            side,
            price: match.price,
            quantity: tradeQty
        }
    });

    // Update matched order
    await prisma.order.update({
      where: { id: match.id },
      data: {
        remainingQuantity: match.remainingQuantity - tradeQty,
        status:
          match.remainingQuantity - tradeQty === 0
            ? "FILLED"
            : "OPEN"
      }
    });

    remaining -= tradeQty;
  }

  // If still remaining → create new order
  if (remaining > 0) {
  await prisma.order.create({
    data: {
      userId,
      marketId,
      side,
      outcome,          // 🔥 THIS WAS MISSING
      price: parsedPrice,
      quantity: parsedQty,
      remainingQuantity: remaining,
      status: "OPEN"
    }
  });
}

  return { success: true };
}

module.exports = { processCLOBOrder };