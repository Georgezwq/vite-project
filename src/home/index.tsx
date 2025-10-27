import { Button } from "antd";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", justifyContent: "start" }}>
      主页
      <div>
        <Button onClick={() => navigate("/home/stock")}>去美股</Button>
      </div>
      <div>
        <Button onClick={() => navigate("/home/astock")}>去A股</Button>
      </div>
    </div>
  );
};

export default Home;
