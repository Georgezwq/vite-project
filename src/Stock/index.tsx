import { Button, Grid, Pagination, Table } from "antd";
import { useEffect, useState } from "react";
import "./index.css";

const { useBreakpoint } = Grid;

const Stock = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const pageSize = 5;

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
      console.log("data", data);
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
      title: "股票代码",
      dataIndex: "symbol",
      key: "symbol",
      fixed: "left" as const,
    },
    {
      title: "当前价格",
      dataIndex: "price",
      key: "price",
      render: (text: any) => text.toFixed(2),
      sorter: (a: any, b: any) => b.price - a.price,
    },
    { title: "公司全名", dataIndex: "name", key: "name" },
    {
      title: "涨跌幅",
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        America stock market
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        <Button
          onClick={fetchPrice}
          style={{ marginRight: "30px", marginTop: isMobile ? 0 : "30px" }}
        >
          {loading ? "加载中..." : "查看股票"}
        </Button>
      </div>
      <div className="table-hscroll">
        <Table
          columns={columns}
          dataSource={stockPrice}
          rowKey="symbol"
          pagination={false}
        />
      </div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
        <Pagination
          current={current}
          pageSize={pageSize}
          total={stockPrice.length}
          onChange={(p) => setCurrent(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default Stock;
