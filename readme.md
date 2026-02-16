
# Jovian Tan (littlejjjjj) Builder — Web3 • RWA • Futures • Automation • Fintech

🔗 GitHub: https://github.com/littlejjjjj
🔗 LinkedIn: https://www.linkedin.com/in/joviantan/
📍 Based in Malaysia (Building globally)

---

# Polyclone 🧠📈

A Polymarket-style prediction market simulation environment built for research, prototyping, and experimentation.

Polyclone replicates the **core mechanics of a prediction market exchange**, including:

- YES/NO market creation
- Orderbook-based trading
- Limit order placement (BUY/SELL)
- Matching engine execution
- Live orderbook view
- Trade tape (recent trades feed)
- User balances and positions
- Market resolution and payout simulation

> ⚠️ This project is a simulation only.
> It does **not** use blockchain and does **not** involve real money.

---

## ✨ Why Polyclone?

Prediction markets are one of the most compelling financial primitives in modern markets — combining:

- crowd forecasting
- probabilistic pricing
- market incentives
- event-driven trading mechanics

This project exists as a research sandbox to explore:

- how prediction market pricing emerges
- how liquidity and spreads behave
- how matching engines operate
- how users trade probabilities instead of assets

---

## 🚀 Features

### Core Exchange Simulation

- ✅ Create markets (YES/NO outcomes)
- ✅ Create users (simulated accounts)
- ✅ Place limit orders (BUY / SELL)
- ✅ Automatic order matching
- ✅ Orderbook view for YES and NO
- ✅ Trade history feed
- ✅ Position tracking per user
- ✅ Admin market resolution
- ✅ Payout simulation (winners receive $1 per share)

### System Design

- Lightweight SQLite database
- Prisma ORM schema modeling
- REST API backend
- React frontend UI

---

## 🧱 Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite
- Matching Engine Logic (Orderbook-based)

### Frontend

- React (Vite)
- Axios
- React Router DOM

---

## 📂 Repository Structure


polyclone/

├── backend/

│   ├── prisma/

│   ├── index.js

│   ├── package.json

│   ├── .env.example

│   └── dev.db (local only, ignored in git)

│

├── frontend/

│   ├── src/

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

├── LICENSE

└── README.md

---
## ⚙️ Setup Guide (Local Development)

### 1) Clone Repository

```bash
git clone https://github.com/littlejjjjj/polyclone.git
cd polyclone
---
