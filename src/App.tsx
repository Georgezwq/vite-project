import { Routes, Route } from "react-router-dom";
import Home from "./home";
import Stock from "./Stock";
import AStock from "./AStock";
import AStockOld from "./AStockOld";
import EastMoney from "./EastMoney";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EastMoney />} />
      <Route path="/home" element={<Home />} />
      <Route path="/home/stock" element={<Stock />} />
      <Route path="/home/astock" element={<AStock />} />
      <Route path="/home/astock-old" element={<AStockOld />} />
      <Route path="/home/eastmoney" element={<EastMoney />} />
    </Routes>
  );
}

export default App;
