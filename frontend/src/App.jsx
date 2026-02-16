import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:4000";

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [question, setQuestion] = useState("");
  const [username, setUsername] = useState("demo");
  const [user, setUser] = useState(null);

  async function loadMarkets() {
    const res = await axios.get(`${API}/markets`);
    setMarkets(res.data);
  }

  async function createMarket() {
    if (!question) return;

    await axios.post(`${API}/markets`, { question });
    setQuestion("");
    loadMarkets();
  }

  async function createUser() {
    const res = await axios.post(`${API}/users`, { username });
    setUser(res.data);
  }

  useEffect(() => {
    loadMarkets();
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Polymarket Clone (Simulation)</h1>

      <div style={{ marginTop: 20, padding: 15, border: "1px solid #ccc" }}>
        <h3>Create Demo User</h3>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />
        <button onClick={createUser} style={{ marginLeft: 10 }}>
          Create User
        </button>

        {user && (
          <p style={{ color: "green" }}>
            User created: {user.username} | Balance: ${user.balance}
          </p>
        )}
      </div>

      <div style={{ marginTop: 20, padding: 15, border: "1px solid #ccc" }}>
        <h3>Create Market</h3>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will Bitcoin hit $200k in 2026?"
          style={{ width: 400 }}
        />
        <button onClick={createMarket} style={{ marginLeft: 10 }}>
          Create Market
        </button>
      </div>

      <h2 style={{ marginTop: 30 }}>Markets</h2>

      {markets.map((m) => (
        <div
          key={m.id}
          style={{
            padding: 12,
            marginTop: 10,
            border: "1px solid #444",
            borderRadius: 6,
          }}
        >
          <Link to={`/market/${m.id}`} style={{ fontWeight: "bold" }}>
            {m.question}
          </Link>

          <div style={{ fontSize: 12, color: "gray" }}>
            Market ID: {m.id} | Resolved: {m.resolved ? "Yes" : "No"}
          </div>
        </div>
      ))}
    </div>
  );
}
