import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

export default function MarketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [engineType, setEngineType] = useState("CLOB");
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all markets
  const fetchMarkets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/markets`);
      const data = await res.json();
      setMarkets(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  // Create new market
  const createMarket = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/markets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          engineType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Create failed");
      }

      setTitle("");
      fetchMarkets();
    } catch (err) {
      console.error("Create error:", err);
      alert("Error creating market");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Polyclone</h1>
        <p className="text-slate-400 mt-2">
          Prediction market exchange (CLOB & AMM)
        </p>
      </div>

      {/* Create Market Card */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Market</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Market title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={engineType}
            onChange={(e) => setEngineType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
          >
            <option value="CLOB">CLOB</option>
            <option value="AMM">AMM</option>
          </select>

          <button
            onClick={createMarket}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Markets List */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Markets</h2>

        {markets.length === 0 ? (
          <p className="text-slate-400">No markets found.</p>
        ) : (
          <div className="space-y-3">
            {markets.map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/market/${market.id}`)}
                className="flex justify-between items-center bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-700 transition"
              >
                <div>
                  <p className="font-medium">{market.title}</p>
                  <p className="text-sm text-slate-400">
                    Expires:{" "}
                    {new Date(market.expiryTime).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    market.engineType === "CLOB"
                      ? "bg-purple-600/20 text-purple-400"
                      : "bg-green-600/20 text-green-400"
                  }`}
                >
                  {market.engineType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}