import { Link } from "react-router-dom";
import { Button, Grid } from "antd";

const { useBreakpoint } = Grid;

const EntryPoint = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        marginTop: "100px",
        marginLeft: "100px",
      }}
    >
      <Link to="/home">
        <Button>
          <span>回到主页</span>
        </Button>
      </Link>
      <div
        style={{
          marginLeft: isMobile ? "0" : "100px",
          marginTop: isMobile ? "60px" : "0",
        }}
      >
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
