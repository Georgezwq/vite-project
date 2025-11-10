import { Button, Grid, Table } from "antd";
import { useEffect, useState } from "react";
import "./index.css";

const { useBreakpoint } = Grid;

const Stock = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState([]);
  const [loading, setLoading] = useState(false);

  // 移除未使用的分页状态，避免构建报错

  const symbols = ["AAPL", "BRK B", "FFAI", "GME", "NIO", "TSLA"];
  const encodedSymbols = symbols.join(",");
  const fetchPrice = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${encodedSymbols}?apikey=FGMjSSqlKG7c9XM9v98xuNocUYG15FnW`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setStockPrice(data);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPrice();
  }, []);
  const columns = [
    {
      title: "",
      dataIndex: "symbol",
      key: "symbol",
      fixed: "left" as const,
      className: "fix-left-white",
    },
    {
      title: "最新",
      minWidth: 50,
      dataIndex: "price",
      key: "price",
      render: (text: any) => text.toFixed(2),
      sorter: (a: any, b: any) => b.price - a.price,
    },
    { title: "公司全名", dataIndex: "name", key: "name" },
    {
      title: "涨跌幅",
      minWidth: 60,
      dataIndex: "changesPercentage",
      key: "changesPercentage",
      render: (text: any) => text.toFixed(2),
      sorter: (a: any, b: any) => b.changesPercentage - a.changesPercentage,
    },
    {
      title: "市值",
      dataIndex: "marketCap",
      key: "marketCap",
      render: (text: any) => {
        if (text >= 1e12) return (text / 1e12).toFixed(2) + "T";
        if (text >= 1e9) return (text / 1e9).toFixed(2) + "B";
        if (text >= 1e6) return (text / 1e6).toFixed(2) + "M";
        if (text >= 1e3) return (text / 1e3).toFixed(2) + "K";
        return text.toString();
      },
      sorter: (a: any, b: any) => b.marketCap - a.marketCap,
    },
    {
      title: "涨跌价格",
      dataIndex: "change",
      key: "change",
      render: (text: any) => text.toFixed(2),
      sorter: (a: any, b: any) => b.change - a.change,
    },
  ];

  return (


      <div>
        <div className="stock-center-title">America stock market</div>
        <div className="stock-header-actions">
          <Button
            onClick={fetchPrice}
            className={`stock-header-button${
              isMobile ? " stock-header-button-mobile" : ""
            }`}
          >
            {loading ? "加载中..." : "查看股票"}
          </Button>
        </div>
        <div className="table-hscroll">
          <Table
            rootClassName="fix-left-override"
            columns={columns}
            dataSource={stockPrice}
            rowKey="symbol"
            pagination={false}
          />
        </div>
        {/* 如需分页，请恢复以下代码并重新引入 Pagination：
            <Pagination
              current={current}
              pageSize={pageSize}
              total={stockPrice.length}
              onChange={(p) => setCurrent(p)}
              showSizeChanger={false}
            />
        */}
      </div>
  );
};

export default Stock;
