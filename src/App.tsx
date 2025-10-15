import { Routes, Route } from "react-router-dom";
import Home from "./home";
import EntryPoint from "./EntryPoint";
import Stock from "./Stock";
import AStock from "./AStock";
function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPoint />} />
      <Route path="/home" element={<Home />} />
      <Route path="/home/stock" element={<Stock />} />
      <Route path="/home/astock" element={<AStock />} />
    </Routes>
  );
}

export default App;
