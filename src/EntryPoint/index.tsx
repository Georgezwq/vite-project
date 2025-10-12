import { Link } from "react-router-dom";
import { Button } from "antd";

const EntryPoint = () => {
  return (
    <div>
      <Link to="/home">
        <Button>
          <span>回到主页</span>
        </Button>
      </Link>
      <Link to="/home/stock">
        <Button>
          <span>查看股票</span>
        </Button>
      </Link>
    </div>
  );
};

export default EntryPoint;
