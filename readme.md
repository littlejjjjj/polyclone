# Jovian Tan (littlejjjjj) — Builder

**Web3 • RWA • Exchange Systems • Market Infrastructure**

🔗 GitHub: https://github.com/littlejjjjj
🔗 LinkedIn: https://www.linkedin.com/in/joviantan/
📍 Based in Malaysia — Building globally

---

# Polyclone 🧠📈

### Hybrid Prediction Market Exchange (CLOB + AMM Simulation)

Polyclone is a full-stack simulation of a **Polymarket-style prediction
market exchange**, built for research, experimentation, and exchange
system prototyping.

It replicates two major trading architectures used in modern markets:

- **CLOB (Central Limit Order Book)**
- **AMM (Automated Market Maker, constant product model)**

> ⚠️ This project is a simulation only.
> It does NOT use blockchain and does NOT handle real money.

---

# 🎯 Project Purpose

Polyclone is a research sandbox to explore:

- How prediction market pricing emerges
- How orderbooks match liquidity
- How AMMs shift prices via liquidity curves
- Spread behavior & slippage
- Hybrid exchange design (CLOB + AMM)

---

# 🚀 Features

## 🏛 Market Engine

- Create markets (CLOB or AMM)
- Market detail view
- Delete market

---

## 📘 CLOB Trading Engine

- Limit BUY / SELL orders
- Price-time priority
- Automatic matching logic
- Partial fills supported
- Live orderbook (Bids / Asks)
- Order sorting (best price first)

Matching logic: - Buy orders match lowest ask - Sell orders match
highest bid - Remaining quantity is added to book

---

## 🔁 AMM Trading Engine

- Constant product pool (x \* y = k)
- YES / NO token pools
- Dynamic price calculation
- Buy YES
- Buy NO
- Automatic price shift
- Pool state endpoint

Price calculation:

priceYES = yes / (yes + no)
priceNO = no / (yes + no)

---

## 🖥 Frontend

- React (Vite)
- React Router
- Tailwind CSS styling
- Dynamic routing:
  - `/` → Market list
  - `/market/:id` → Trading view
- Engine-specific UI rendering

---

## 🧱 Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite (local development)
- In-memory CLOB engine
- In-memory AMM pool engine

### Frontend

- React
- Vite
- React Router DOM
- Fetch API
- Tailwind CSS

---

# 🏗 Architecture

Frontend (React)
↓
REST API (Express)
↓
Prisma ORM
↓
SQLite Database

Trading Engines:

CLOB → In-memory orderbook per market
AMM → In-memory constant product pool per market

---

# 📂 Repository Structure

polyclone/


<pre>
```bash
polyclone/
├── backend/
│   ├── prisma/
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── dev.db (ignored in git)
│
├── frontend/
│   ├── src/
│   │   ├── MarketPage.jsx
│   │   ├── MarketDetail.jsx
│   │   ├── CLOBTrading.jsx
│   │   ├── AMMTrading.jsx
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```
</pre>

---

# ⚙️ Local Development Setup

## Requirements

- Node.js v18+
- npm

---

## 1️⃣ Clone Repository

`git clone https://github.com/littlejjjjj/polyclone.git`

---

## 2️⃣ Backend Setup

`cd backend`

Backend runs on:
http://localhost:4000

---

## 3️⃣ Frontend Setup

`cd frontend`

Frontend runs on:
http://localhost:5173

---

# 🧪 How to Use

1. Create a market (choose CLOB or AMM)
2. Click into the market
3. Trade using the selected engine

---

# 📊 Future Improvements

- Trade history panel
- Slippage preview
- Spread indicator
- Fee model
- Liquidity provision (LP)
- Wallet balances
- Event resolution + payout logic
- Persistent engine storage
- WebSocket live updates
- Hybrid routing logic

---

# 📜 License

MIT License
