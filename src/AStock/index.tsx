import { Button, Grid, Pagination, Table } from "antd";
import type { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import "./index.css";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap: number;
}

const { useBreakpoint } = Grid;

const AStock = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);

  // A股股票代码
  const symbols = ["600519", "601318", "600036", "601166", "600276", "000858"];
  const pageSize = symbols.length;
  
  const fetchPrice = async () => { // Data fetching logic updated previously
    setLoading(true);
    try {
      const formattedSymbols = symbols.map(symbol => {
        return symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
      }).join(',');
      
      const apiUrl = `https://qt.gtimg.cn/q=${formattedSymbols}`;
      
      // Dynamically create a script tag to bypass CORS
      const script: HTMLScriptElement = document.createElement('script');
      script.src = apiUrl;
      document.body.appendChild(script);

      // Wait for the script to load and define the global variables
      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          document.body.removeChild(script); // Clean up the script tag
          resolve();
        };
        script.onerror = () => {
          document.body.removeChild(script);
          reject(new Error('Failed to load stock data script.'));
        };
      });

      const stockData: any = [];
      
      // Iterate through the symbols and read the global variables
      symbols.forEach(symbol => {
        const fullCode = symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
        const globalVarName = `v_${fullCode}`;
        
        // Access the global variable
        const rawData = (window as any)[globalVarName]; // Cast window to any to avoid TS error
        
        if (rawData) {
          const data = rawData.split('~');
          if (data.length > 30) {
            const name = data[1];
            const price = parseFloat(data[3]);
            const prevClose = parseFloat(data[4]);
            const change = price - prevClose;
            const changesPercentage = parseFloat(data[32]);
            const marketCap = parseFloat(data[45]) * 10000; // 市值
            
            stockData.push({
              symbol: symbol, // Use original symbol
              name,
              price,
              change,
              changesPercentage,
              marketCap: isNaN(marketCap) ? 0 : marketCap
            });
          }
        }
      });
      
      if (stockData.length === 0) {
        throw new Error("未能解析股票数据");
      }
      
      setStockPrice(stockData);
      console.log("A股数据", stockData);
    } catch (error) {
      console.error("获取A股价格出错:", error);
      // Fallback to mock data
      const mockData = symbols.map((symbol) => {
        const price = Math.random() * 1000 + 10;
        const change = (Math.random() * 20) - 10;
        const changesPercentage = (change / price) * 100;
        
        return {
          symbol,
          name: getStockName(symbol),
          price,
          change,
          changesPercentage,
          marketCap: Math.random() * 1e12,
        };
      });
      
      setStockPrice(mockData);    
    } finally {
      setLoading(false);
    }
  };
  
  // 获取股票名称的辅助函数
  const getStockName = (symbol: string): string => {
    const nameMap: { [key: string]: string } = {
      "600519": "贵州茅台",
      "601318": "中国平安",
      "600036": "招商银行",
      "601166": "兴业银行",
      "600276": "恒瑞医药",
      "000858": "五粮液"
    };
    return nameMap[symbol] || `股票${symbol}`;
  };
  
  useEffect(() => {
    fetchPrice();
  }, []);
  
  const columns: ColumnType<StockData>[] = [
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
    { title: "公司名称", dataIndex: "name", key: "name" },
    {
      title: "涨跌幅",
      dataIndex: "changesPercentage",
      key: "changesPercentage",
      render: (text: any) => text.toFixed(2) + "%",
      sorter: (a: any, b: any) => b.changesPercentage - a.changesPercentage,
    },
    {
      title: "市值",
      dataIndex: "marketCap",
      key: "marketCap",
      render: (text: any) => {
        if (text >= 1e12) return (text / 1e12).toFixed(2) + "万亿";
        if (text >= 1e9) return (text / 1e9).toFixed(2) + "亿";
        if (text >= 1e6) return (text / 1e6).toFixed(2) + "百万";
        if (text >= 1e3) return (text / 1e3).toFixed(2) + "千";
        return text.toString();
      },
      sorter: (a: any, b: any) => b.marketCap - a.marketCap,
      responsive: ["md"],
    },
    {
      title: "涨跌价格",
      dataIndex: "change",
      key: "change",
      render: (text: any) => text.toFixed(2),
      sorter: (a: any, b: any) => b.change - a.change,
      responsive: ["md"],
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        中国A股市场
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "end",
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        <Button
          onClick={fetchPrice}
          style={{ marginRight: isMobile ? "0" : "30px", marginTop: isMobile ? "10px" : "30px" }}
        >
          {loading ? "加载中..." : "刷新行情"}
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

export default AStock;