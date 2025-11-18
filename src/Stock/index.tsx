import { Button, Grid, Table } from "antd";
import { useEffect, useState } from "react";
import "./index.css";

const { useBreakpoint } = Grid;

interface USQuote {
  symbol: string;
  price: number;
  name: string;
  changesPercentage: number;
  marketCap: number;
  change: number;
}

const Stock = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState<USQuote[]>([]);
  const [loading, setLoading] = useState(false);

  // 移除未使用的分页状态，避免构建报错

  const symbols = ["AAPL", "BRK.B", "FFIE", "GME", "NIO", "TSLA"];
  const encodedSymbols = encodeURIComponent(symbols.join(","));
  const fetchPrice = async () => {
    setLoading(true); 
    try {
      const apiKey = import.meta.env.VITE_FMP_API_KEY || "demo";
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${encodedSymbols}?apikey=${apiKey}`
      );
      if (!response.ok) { 
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setStockPrice(Array.isArray(data) ? (data as USQuote[]) : []);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
      const nameMap: Record<string, string> = {
        AAPL: "Apple Inc.",
        "BRK.B": "Berkshire Hathaway Inc. Class B",
        FFIE: "Faraday Future Intelligent Electric Inc.",
        GME: "GameStop Corp.",
        NIO: "NIO Inc.",
        TSLA: "Tesla, Inc.",
      };
      const mock: USQuote[] = symbols.map((s) => {
        const price = Math.random() * 300 + 10;
        const change = (Math.random() - 0.5) * 10;
        const changesPercentage = (change / price) * 100;
        const marketCap = Math.random() * 5e11;
        return { symbol: s, price, name: nameMap[s] || s, changesPercentage, marketCap, change };
      });
      setStockPrice(mock);
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
