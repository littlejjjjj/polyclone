import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function CLOBTrading({ marketId }) {
  const [book, setBook] = useState({ bids: [], asks: [] });
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");

  const fetchBook = async () => {
    const res = await fetch(
      `${API_URL}/api/markets/${marketId}/orderbook`
    );
    const data = await res.json();

    setBook({
      bids: data.bids || [],
      asks: data.asks || [],
    });
  };

  useEffect(() => {
    fetchBook();
  }, [marketId]);

  const placeOrder = async (side) => {
    await fetch(`${API_URL}/api/markets/${marketId}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        side,
        price,
        size,
      }),
    });

    setPrice("");
    setSize("");
    fetchBook();
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">CLOB Orderbook</h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="mb-2 text-green-400">Bids</h4>
          {book.bids.map((b) => (
            <div key={b.id}>
              {b.price} — {b.size}
            </div>
          ))}
        </div>

        <div>
          <h4 className="mb-2 text-red-400">Asks</h4>
          {book.asks.map((a) => (
            <div key={a.id}>
              {a.price} — {a.size}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-x-2">
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-2 py-1 bg-slate-800 rounded"
        />

        <input
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="px-2 py-1 bg-slate-800 rounded"
        />

        <button
          onClick={() => placeOrder("buy")}
          className="bg-green-600 px-3 py-1 rounded"
        >
          Buy
        </button>

        <button
          onClick={() => placeOrder("sell")}
          className="bg-red-600 px-3 py-1 rounded"
        >
          Sell
        </button>
      </div>
    </div>
  );
}