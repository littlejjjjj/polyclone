import { Routes, Route } from "react-router-dom";
import MarketPage from "./MarketPage";
import MarketDetail from "./MarketDetail";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<MarketPage />} />
          <Route path="/market/:id" element={<MarketDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;