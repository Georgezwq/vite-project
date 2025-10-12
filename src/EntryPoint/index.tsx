import { Link } from "react-router-dom";
import { Button } from "antd";

const EntryPoint = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginTop: "100px",
        marginLeft: "100px",
      }}
    >
      <Link to="/home">
        <Button>
          <span>回到主页</span>
        </Button>
      </Link>
      <div style={{ marginLeft: "100px" }}>
        <Link to="/home/stock">
          <Button>
            <span>查看股票</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EntryPoint;
