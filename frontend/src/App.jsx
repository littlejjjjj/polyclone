import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./App.css";

const API = "http://localhost:4000";

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMarkets();
  }, []);

  async function loadMarkets() {
    const res = await axios.get(`${API}/markets`);
    setMarkets(res.data);
  }

  const filteredMarkets = markets.filter((m) =>
    m.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">Polyclone</div>

        <div className="searchbar">
          <input
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="nav-actions">
          <button className="btn">Log In</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="container">
        <div className="section-title">Trending Markets</div>

        <div className="grid">
          {filteredMarkets.map((m) => (
            <div key={m.id} className="card">
              <div className="market-title">{m.question}</div>

              <div className="market-meta">
                Market ID: {m.id} •{" "}
                {m.resolved ? (
                  <span className="badge">Resolved</span>
                ) : (
                  <span className="badge">Live</span>
                )}
              </div>

              <div className="market-actions">
                <Link className="market-btn yes" to={`/market/${m.id}`}>
                  YES
                </Link>

                <Link className="market-btn no" to={`/market/${m.id}`}>
                  NO
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div style={{ marginTop: "20px", color: "rgba(255,255,255,0.5)" }}>
            No markets found.
          </div>
        )}
      </div>
    </>
  );
}
