import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./App.css";

const API = "http://localhost:4000";

export default function MarketPage() {
  const { id } = useParams();
  const marketId = parseInt(id);

  const [market, setMarket] = useState(null);
  const [userId, setUserId] = useState(1);

  const [price, setPrice] = useState(0.5);
  const [quantity, setQuantity] = useState(10);

  const [yesOrderbook, setYesOrderbook] = useState({ buys: [], sells: [] });
  const [noOrderbook, setNoOrderbook] = useState({ buys: [], sells: [] });

  const [trades, setTrades] = useState([]);

  useEffect(() => {
    loadAll();

    const interval = setInterval(() => {
      loadOrderbooks();
      loadTrades();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    await loadMarket();
    await loadOrderbooks();
    await loadTrades();
  }

  async function loadMarket() {
    const res = await axios.get(`${API}/markets`);
    const found = res.data.find((m) => m.id === marketId);
    setMarket(found);
  }

  async function loadOrderbooks() {
    const yes = await axios.get(`${API}/orderbook/${marketId}/YES`);
    const no = await axios.get(`${API}/orderbook/${marketId}/NO`);
    setYesOrderbook(yes.data);
    setNoOrderbook(no.data);
  }

  async function loadTrades() {
    const res = await axios.get(`${API}/trades/${marketId}`);
    setTrades(res.data);
  }

  async function placeOrder(side, direction) {
    try {
      await axios.post(`${API}/orders`, {
        userId: parseInt(userId),
        marketId,
        side,
        direction,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      });

      await loadOrderbooks();
      await loadTrades();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">
          <Link to="/">Polyclone</Link>
        </div>

        <div className="searchbar">
          <input value={`Market #${marketId}`} disabled />
        </div>

        <div className="nav-actions">
          <button className="btn">Log In</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>

      <div className="container">
        {/* MARKET HEADER */}
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>
                {market?.question || "Loading market..."}
              </div>
              <div className="small-muted" style={{ marginTop: "6px" }}>
                Market ID: {marketId} •{" "}
                {market?.resolved ? "Resolved" : "Live"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className="badge">Demo Mode</span>
              <Link className="btn" to="/">
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* TRADE PANEL */}
        <div className="row">
          <div className="col">
            <div className="panel">
              <div style={{ fontSize: "16px", fontWeight: 800 }}>
                Trade Panel
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="small-muted">User ID</div>
                <input
                  className="input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="small-muted">Price (0 - 1)</div>
                <input
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="small-muted">Quantity</div>
                <input
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="trade-buttons">
                <button
                  className="trade-btn buy"
                  onClick={() => placeOrder("YES", "BUY")}
                >
                  Buy YES
                </button>
                <button
                  className="trade-btn sell"
                  onClick={() => placeOrder("YES", "SELL")}
                >
                  Sell YES
                </button>
              </div>

              <div className="trade-buttons">
                <button
                  className="trade-btn buy"
                  onClick={() => placeOrder("NO", "BUY")}
                >
                  Buy NO
                </button>
                <button
                  className="trade-btn sell"
                  onClick={() => placeOrder("NO", "SELL")}
                >
                  Sell NO
                </button>
              </div>

              <div className="small-muted" style={{ marginTop: "14px" }}>
                Orders are LIMIT orders. Matching happens instantly if prices
                cross.
              </div>
            </div>
          </div>
        </div>

        {/* ORDERBOOKS + TRADES */}
        <div className="row">
          <div className="col">
            <div className="panel">
              <div style={{ fontSize: "15px", fontWeight: 800 }}>YES Orderbook</div>

              <div style={{ marginTop: "12px" }}>
                <div className="small-muted">BUY Orders</div>
                {yesOrderbook.buys.map((o) => (
                  <div key={o.id} className="list-item">
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>
                      {o.price.toFixed(3)}
                    </span>{" "}
                    | qty {o.quantity - o.filled}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="small-muted">SELL Orders</div>
                {yesOrderbook.sells.map((o) => (
                  <div key={o.id} className="list-item">
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>
                      {o.price.toFixed(3)}
                    </span>{" "}
                    | qty {o.quantity - o.filled}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col">
            <div className="panel">
              <div style={{ fontSize: "15px", fontWeight: 800 }}>NO Orderbook</div>

              <div style={{ marginTop: "12px" }}>
                <div className="small-muted">BUY Orders</div>
                {noOrderbook.buys.map((o) => (
                  <div key={o.id} className="list-item">
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>
                      {o.price.toFixed(3)}
                    </span>{" "}
                    | qty {o.quantity - o.filled}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="small-muted">SELL Orders</div>
                {noOrderbook.sells.map((o) => (
                  <div key={o.id} className="list-item">
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>
                      {o.price.toFixed(3)}
                    </span>{" "}
                    | qty {o.quantity - o.filled}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col">
            <div className="panel">
              <div style={{ fontSize: "15px", fontWeight: 800 }}>Recent Trades</div>

              <div style={{ marginTop: "12px" }}>
                {trades.map((t) => (
                  <div key={t.id} className="list-item">
                    <b>{t.side}</b> @ {t.price.toFixed(3)} | qty {t.quantity}
                  </div>
                ))}

                {trades.length === 0 && (
                  <div className="small-muted">No trades yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
