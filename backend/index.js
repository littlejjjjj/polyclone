const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Simple Matching Engine:
 * Matches BUY and SELL orders for the same market + side
 * BUY orders sorted by highest price first
 * SELL orders sorted by lowest price first
 * Executes trades when BUY price >= SELL price
 */
async function matchOrders(marketId, side) {
  while (true) {
    const bestBuy = await prisma.order.findFirst({
      where: {
        marketId,
        side,
        direction: "BUY",
        status: { in: ["OPEN", "PARTIAL"] },
      },
      orderBy: { price: "desc" },
    });

    const bestSell = await prisma.order.findFirst({
      where: {
        marketId,
        side,
        direction: "SELL",
        status: { in: ["OPEN", "PARTIAL"] },
      },
      orderBy: { price: "asc" },
    });

    // no orders available
    if (!bestBuy || !bestSell) break;

    // no match possible
    if (bestBuy.price < bestSell.price) break;

    const buyRemaining = bestBuy.quantity - bestBuy.filled;
    const sellRemaining = bestSell.quantity - bestSell.filled;

    const tradeQty = Math.min(buyRemaining, sellRemaining);

    // execute at sell price (ask price)
    const tradePrice = bestSell.price;

    const tradeCost = tradeQty * tradePrice;

    // get users
    const buyer = await prisma.user.findUnique({ where: { id: bestBuy.userId } });
    const seller = await prisma.user.findUnique({ where: { id: bestSell.userId } });

    if (!buyer || !seller) break;

    // buyer must have balance
    if (buyer.balance < tradeCost) {
      // cancel buy order if insufficient funds
      await prisma.order.update({
        where: { id: bestBuy.id },
        data: { status: "CANCELLED" },
      });
      continue;
    }

    // update order fills
    const newBuyFilled = bestBuy.filled + tradeQty;
    const newSellFilled = bestSell.filled + tradeQty;

    const buyStatus = newBuyFilled >= bestBuy.quantity ? "FILLED" : "PARTIAL";
    const sellStatus = newSellFilled >= bestSell.quantity ? "FILLED" : "PARTIAL";

    await prisma.order.update({
      where: { id: bestBuy.id },
      data: { filled: newBuyFilled, status: buyStatus },
    });

    await prisma.order.update({
      where: { id: bestSell.id },
      data: { filled: newSellFilled, status: sellStatus },
    });

    // record trade
    await prisma.trade.create({
      data: {
        marketId,
        buyerId: buyer.id,
        sellerId: seller.id,
        side,
        price: tradePrice,
        quantity: tradeQty,
      },
    });

    // update balances
    await prisma.user.update({
      where: { id: buyer.id },
      data: { balance: { decrement: tradeCost } },
    });

    await prisma.user.update({
      where: { id: seller.id },
      data: { balance: { increment: tradeCost } },
    });

    // update positions
    await updatePosition(buyer.id, marketId, side, tradeQty, tradePrice);
    await updatePosition(seller.id, marketId, side, -tradeQty, tradePrice);
  }
}

/**
 * Update position for a user.
 * If shares increase, avgPrice updates using weighted average.
 * If shares decrease, avgPrice stays the same.
 */
async function updatePosition(userId, marketId, side, deltaShares, tradePrice) {
  let pos = await prisma.position.findFirst({
    where: { userId, marketId, side },
  });

  if (!pos) {
    pos = await prisma.position.create({
      data: {
        userId,
        marketId,
        side,
        shares: 0,
        avgPrice: 0,
      },
    });
  }

  const oldShares = pos.shares;
  const newShares = oldShares + deltaShares;

  // selling all shares (or going negative)
  if (newShares <= 0) {
    await prisma.position.update({
      where: { id: pos.id },
      data: {
        shares: newShares,
      },
    });
    return;
  }

  // if buying shares (deltaShares positive)
  if (deltaShares > 0) {
    const oldCost = pos.avgPrice * oldShares;
    const newCost = tradePrice * deltaShares;
    const avgPrice = (oldCost + newCost) / newShares;

    await prisma.position.update({
      where: { id: pos.id },
      data: {
        shares: newShares,
        avgPrice,
      },
    });
  } else {
    // selling shares, avg price unchanged
    await prisma.position.update({
      where: { id: pos.id },
      data: {
        shares: newShares,
      },
    });
  }
}

/**
 * ROOT ROUTE (fixes Cannot GET /)
 */
app.get("/", (req, res) => {
  res.send("Polymarket Clone Backend is running. Try /health or /markets");
});

/**
 * HEALTH CHECK
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "polyclone-backend" });
});

/**
 * CREATE USER
 */
app.post("/users", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const user = await prisma.user.create({
      data: { username },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LIST USERS
 */
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  res.json(users);
});

/**
 * CREATE MARKET
 */
app.post("/markets", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const market = await prisma.market.create({
      data: { question },
    });

    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LIST MARKETS
 */
app.get("/markets", async (req, res) => {
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(markets);
});

/**
 * PLACE LIMIT ORDER
 */
app.post("/orders", async (req, res) => {
  try {
    const { userId, marketId, side, direction, price, quantity } = req.body;

    if (!userId || !marketId || !side || !direction || !price || !quantity) {
      return res.status(400).json({
        error: "userId, marketId, side, direction, price, quantity required",
      });
    }

    if (!["YES", "NO"].includes(side)) {
      return res.status(400).json({ error: "side must be YES or NO" });
    }

    if (!["BUY", "SELL"].includes(direction)) {
      return res.status(400).json({ error: "direction must be BUY or SELL" });
    }

    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }

    if (market.resolved) {
      return res.status(400).json({ error: "Market already resolved" });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        marketId,
        side,
        direction,
        type: "LIMIT",
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        filled: 0,
        status: "OPEN",
      },
    });

    // Match orders immediately after inserting new one
    await matchOrders(marketId, side);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET ORDERBOOK FOR MARKET + SIDE
 */
app.get("/orderbook/:marketId/:side", async (req, res) => {
  const marketId = parseInt(req.params.marketId);
  const side = req.params.side;

  if (!["YES", "NO"].includes(side)) {
    return res.status(400).json({ error: "side must be YES or NO" });
  }

  const buys = await prisma.order.findMany({
    where: {
      marketId,
      side,
      direction: "BUY",
      status: { in: ["OPEN", "PARTIAL"] },
    },
    orderBy: { price: "desc" },
  });

  const sells = await prisma.order.findMany({
    where: {
      marketId,
      side,
      direction: "SELL",
      status: { in: ["OPEN", "PARTIAL"] },
    },
    orderBy: { price: "asc" },
  });

  res.json({ buys, sells });
});

/**
 * GET TRADES FOR MARKET
 */
app.get("/trades/:marketId", async (req, res) => {
  const marketId = parseInt(req.params.marketId);

  const trades = await prisma.trade.findMany({
    where: { marketId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(trades);
});

/**
 * GET POSITIONS FOR USER
 */
app.get("/positions/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const positions = await prisma.position.findMany({
    where: { userId },
  });

  res.json(positions);
});

/**
 * RESOLVE MARKET (ADMIN)
 */
app.post("/resolve", async (req, res) => {
  try {
    const { marketId, outcome } = req.body;

    if (!marketId || !outcome) {
      return res.status(400).json({ error: "marketId and outcome required" });
    }

    if (!["YES", "NO"].includes(outcome)) {
      return res.status(400).json({ error: "outcome must be YES or NO" });
    }

    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market) return res.status(404).json({ error: "Market not found" });

    if (market.resolved) {
      return res.status(400).json({ error: "Market already resolved" });
    }

    // mark market resolved
    await prisma.market.update({
      where: { id: marketId },
      data: { resolved: true, outcome },
    });

    // payout winners: each share = $1
    const winningPositions = await prisma.position.findMany({
      where: { marketId, side: outcome },
    });

    for (const pos of winningPositions) {
      const payout = pos.shares * 1.0;

      await prisma.user.update({
        where: { id: pos.userId },
        data: { balance: { increment: payout } },
      });
    }

    res.json({ message: `Market ${marketId} resolved as ${outcome}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * START SERVER
 */
app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
