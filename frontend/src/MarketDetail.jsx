import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CLOBTrading from "./CLOBTrading";
import AMMTrading from "./AMMTrading";

const API_URL = "http://localhost:4000";

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH MARKET
  ========================= */

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch(`${API_URL}/api/markets`);
        const data = await res.json();
        const found = data.find((m) => String(m.id) === String(id));

        setMarket(found || null);
      } catch (err) {
        console.error("Fetch market error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [id]);

  /* =========================
     DELETE MARKET
  ========================= */

  const deleteMarket = async () => {
    if (!window.confirm("Delete this market?")) return;

    try {
      await fetch(`${API_URL}/api/markets/${id}`, {
        method: "DELETE",
      });

      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  if (!market) {
    return (
      <div className="text-white p-10">
        Market not found.
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-blue-400 hover:underline"
        >
          ← Back to Markets
        </button>

        {/* Market Card */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

          <h1 className="text-2xl font-bold mb-2">
            {market.title}
          </h1>

          <p className="text-slate-400 mb-4">
            Expires: {new Date(market.expiryTime).toLocaleString()}
          </p>

          {/* Engine Badge */}
          <div className="mb-6">
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

          {/* Delete Button */}
          <button
            onClick={deleteMarket}
            className="mb-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Delete Market
          </button>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-6">

            {/* CLOB TRADING */}
            {market.engineType === "CLOB" && (
              <CLOBTrading marketId={id} />
            )}

            {/* AMM TRADING */}
            {market.engineType === "AMM" && (
              <AMMTrading marketId={id} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}