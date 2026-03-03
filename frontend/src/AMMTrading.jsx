import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function AMMTrading({ marketId }) {
  const [pool, setPool] = useState(null);
  const [amount, setAmount] = useState("");

  const fetchPool = async () => {
    const res = await fetch(`${API_URL}/api/markets/${marketId}/amm`);
    const data = await res.json();
    setPool(data);
  };

  useEffect(() => {
    fetchPool();
  }, [marketId]);

  const buyYes = async () => {
    await fetch(`${API_URL}/api/markets/${marketId}/amm/buy-yes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    setAmount("");
    fetchPool();
  };

  const buyNo = async () => {
    await fetch(`${API_URL}/api/markets/${marketId}/amm/buy-no`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    setAmount("");
    fetchPool();
  };

  if (!pool) return <div>Loading AMM...</div>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">AMM Pool</h3>

      <div className="mb-4">
        <p>YES Pool: {pool.yes.toFixed(2)}</p>
        <p>NO Pool: {pool.no.toFixed(2)}</p>
      </div>

      <div className="mb-4">
        <p>YES Price: {(pool.priceYes * 100).toFixed(2)}%</p>
        <p>NO Price: {(pool.priceNo * 100).toFixed(2)}%</p>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-2 py-1 bg-slate-800 rounded"
        />

        <button
          onClick={buyYes}
          className="bg-green-600 px-3 py-1 rounded"
        >
          Buy YES
        </button>

        <button
          onClick={buyNo}
          className="bg-red-600 px-3 py-1 rounded"
        >
          Buy NO
        </button>
      </div>
    </div>
  );
}