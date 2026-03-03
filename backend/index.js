require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

/* =========================
   IN-MEMORY ENGINES
========================= */

const orderbooks = {}; // CLOB
const pools = {};      // AMM

/* =========================
   HEALTH
========================= */

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   CREATE MARKET
========================= */

app.post("/api/markets", async (req, res) => {
  try {
    const { title, engineType } = req.body;

    if (!title || !engineType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const market = await prisma.market.create({
      data: {
        title,
        engineType,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    res.json(market);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
});

/* =========================
   GET MARKETS
========================= */

app.get("/api/markets", async (req, res) => {
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(markets);
});

/* =========================
   DELETE MARKET
========================= */

app.delete("/api/markets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.market.delete({
      where: { id: Number(id) },
    });

    delete orderbooks[id];
    delete pools[id];

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =========================
   CLOB ORDERBOOK
========================= */

app.get("/api/markets/:id/orderbook", (req, res) => {
  const { id } = req.params;

  if (!orderbooks[id]) {
    orderbooks[id] = { bids: [], asks: [] };
  }

  res.json(orderbooks[id]);
});

app.post("/api/markets/:id/order", (req, res) => {
  const { id } = req.params;
  const { side, price, size } = req.body;

  if (!orderbooks[id]) {
    orderbooks[id] = { bids: [], asks: [] };
  }

  const book = orderbooks[id];

  let remaining = Number(size);
  const orderPrice = Number(price);

  if (side === "buy") {
    // Try match against lowest ask
    book.asks.sort((a, b) => a.price - b.price);

    while (remaining > 0 && book.asks.length > 0) {
      const bestAsk = book.asks[0];

      if (orderPrice >= bestAsk.price) {
        const tradeSize = Math.min(remaining, bestAsk.size);

        bestAsk.size -= tradeSize;
        remaining -= tradeSize;

        if (bestAsk.size === 0) {
          book.asks.shift();
        }
      } else {
        break;
      }
    }

    if (remaining > 0) {
      book.bids.push({
        id: Date.now(),
        price: orderPrice,
        size: remaining,
      });

      book.bids.sort((a, b) => b.price - a.price);
    }

  } else {
    // SELL
    book.bids.sort((a, b) => b.price - a.price);

    while (remaining > 0 && book.bids.length > 0) {
      const bestBid = book.bids[0];

      if (orderPrice <= bestBid.price) {
        const tradeSize = Math.min(remaining, bestBid.size);

        bestBid.size -= tradeSize;
        remaining -= tradeSize;

        if (bestBid.size === 0) {
          book.bids.shift();
        }
      } else {
        break;
      }
    }

    if (remaining > 0) {
      book.asks.push({
        id: Date.now(),
        price: orderPrice,
        size: remaining,
      });

      book.asks.sort((a, b) => a.price - b.price);
    }
  }

  res.json(book);
});

/* =========================
   AMM
========================= */

app.post("/api/markets/:id/amm/buy", (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!pools[id]) {
    pools[id] = { yes: 1000, no: 1000 };
  }

  const pool = pools[id];
  const k = pool.yes * pool.no;

  pool.yes += Number(amount);
  pool.no = k / pool.yes;

  res.json(pool);
});

/* =========================
   AMM ENGINE
========================= */

app.get("/api/markets/:id/amm", (req, res) => {
  const { id } = req.params;

  if (!pools[id]) {
    pools[id] = { yes: 1000, no: 1000 };
  }

  const pool = pools[id];

  const priceYes = pool.yes / (pool.yes + pool.no);
  const priceNo = pool.no / (pool.yes + pool.no);

  res.json({
    ...pool,
    priceYes,
    priceNo,
  });
});

/* BUY YES */
app.post("/api/markets/:id/amm/buy-yes", (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!pools[id]) {
    pools[id] = { yes: 1000, no: 1000 };
  }

  const pool = pools[id];
  const k = pool.yes * pool.no;

  pool.yes += Number(amount);
  pool.no = k / pool.yes;

  res.json(pool);
});

/* BUY NO */
app.post("/api/markets/:id/amm/buy-no", (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!pools[id]) {
    pools[id] = { yes: 1000, no: 1000 };
  }

  const pool = pools[id];
  const k = pool.yes * pool.no;

  pool.no += Number(amount);
  pool.yes = k / pool.no;

  res.json(pool);
});

app.listen(PORT, () => {
  console.log("Server running on port 4000");
});