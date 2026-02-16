import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:4000";

export default function MarketPage() {
  const { id } = useParams();
  const marketId = parseInt(id);

  const [market, setMarket] = useState(null);
  const [orderbookYes, setOrderbookYes] = useState({ buys: [], sells: [] });
  const [orderbookNo, setOrderbookNo] = useState({ buys: [], sells: [] });
  const [trades, setTrades] = useState([]);

  const [userId, setUserId] = useState(1);

  const [price, setPrice] = useState(0.5);
  const [qty, setQty] = useState(10);

  async function load() {
    const marketsRes = await axios.get(`${API}/markets`);
    const m = marketsRes.data.find((x) => x.id === marketId);
    setMarket(m);

    const yes = await axios.get(`${API}/orderbook/${marketId}/YES`);
    const no = await axios.get(`${API}/orderbook/${marketId}/NO`);
    const tr = await axios.get(`${API}/trades/${marketId}`);

    setOrderbookYes(yes.data);
    setOrderbookNo(no.data);
    setTrades(tr.data);
  }

  async function placeOrder(side, direction) {
    await axios.post(`${API}/orders`, {
      userId: parseInt(userId),
      marketId,
      side,
      direction,
      price: parseFloat(price),
      quantity: parseFloat(qty),
    });

    load();
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!market) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>{market.question}</h1>
      <p style={{ color: "gray" }}>
        Market #{market.id} | Resolved: {market.resolved ? "Yes" : "No"}
      </p>

      <div style={{ marginTop: 20 }}>
        <label>User ID: </label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: 80 }}
        />
      </div>

      <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 15 }}>
        <h3>Trade Panel</h3>

        <div>
          <label>Price (0 - 1): </label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Quantity: </label>
          <input value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>

        <div style={{ marginTop: 15 }}>
          <button onClick={() => placeOrder("YES", "BUY")}>Buy YES</button>
          <button onClick={() => placeOrder("YES", "SELL")} style={{ marginLeft: 10 }}>
            Sell YES
          </button>
          <button onClick={() => placeOrder("NO", "BUY")} style={{ marginLeft: 10 }}>
            Buy NO
          </button>
          <button onClick={() => placeOrder("NO", "SELL")} style={{ marginLeft: 10 }}>
            Sell NO
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        <div style={{ flex: 1, border: "1px solid #ccc", padding: 15 }}>
          <h3>YES Orderbook</h3>

          <h4 style={{ color: "green" }}>BUY Orders</h4>
          {orderbookYes.buys.map((o) => (
            <div key={o.id}>
              {o.price.toFixed(3)} | qty {o.quantity - o.filled}
            </div>
          ))}

          <h4 style={{ color: "red", marginTop: 15 }}>SELL Orders</h4>
          {orderbookYes.sells.map((o) => (
            <div key={o.id}>
              {o.price.toFixed(3)} | qty {o.quantity - o.filled}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, border: "1px solid #ccc", padding: 15 }}>
          <h3>NO Orderbook</h3>

          <h4 style={{ color: "green" }}>BUY Orders</h4>
          {orderbookNo.buys.map((o) => (
            <div key={o.id}>
              {o.price.toFixed(3)} | qty {o.quantity - o.filled}
            </div>
          ))}

          <h4 style={{ color: "red", marginTop: 15 }}>SELL Orders</h4>
          {orderbookNo.sells.map((o) => (
            <div key={o.id}>
              {o.price.toFixed(3)} | qty {o.quantity - o.filled}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, border: "1px solid #ccc", padding: 15 }}>
          <h3>Recent Trades</h3>

          {trades.map((t) => (
            <div key={t.id}>
              {t.side} @ {t.price.toFixed(3)} | qty {t.quantity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
