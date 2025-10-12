import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";
import EntryPoint from "./EntryPoint";
import Stock from "./Stock";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPoint />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home/stock" element={<Stock />} />
      </Routes>
    </Router>
  );
}

export default App;
