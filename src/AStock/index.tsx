import { Button, Grid, Pagination, Table } from "antd";
import type { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import "./index.css";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  marketCap: number;
  change: number;
  // 根据实际数据结构，可能需要添加更多属性
}

const { useBreakpoint } = Grid;

const AStock = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);

  // A股股票代码
  const symbols = [
    "600519", "601318", "600036", "601166", "600276", "000858",
    "000001", "000002", "000333", "000651", "000876", "002008",
    "002230", "002415", "002460", "002594", "300059", "300751",
    "600000", "600016", "600028", "600030", "600050", "600104",
    "600196", "600271", "600309", "600438", "600585", "600690"
  ];
  const pageSize = 5;
  
  const fetchPrice = async () => { // Data fetching logic updated previously
    setLoading(true);
    try {
      const formattedSymbols = symbols.map(symbol => {
        return symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
      }).join(',');
      console.log("Formatted Symbols:", formattedSymbols);
      
      const apiUrl = `https://qt.gtimg.cn/q=${formattedSymbols}`;
      console.log("API URL:", apiUrl);
      
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

      const stockData: StockData[] = [];
      
      // Iterate through the symbols and read the global variables
      symbols.forEach(symbol => {
        const fullCode = symbol.startsWith('6') ? `sh${symbol}` : `sz${symbol}`;
        const globalVarName = `v_${fullCode}`;
        
        // Access the global variable
        const rawData = (window as any)[globalVarName]; // Cast window to any to avoid TS error
        console.log(`Raw Data for ${symbol}:`, rawData);
        
        if (rawData) {
          const data = rawData.split('~');
          console.log(`Parsed Data for ${symbol}:`, data);
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
      console.log("Final Stock Data:", stockData);
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
      "000858": "五粮液",
      "000001": "平安银行",
      "000002": "万科A",
      "000333": "美的集团",
      "000651": "格力电器",
      "000876": "新希望",
      "002008": "大族激光",
      "002230": "科大讯飞",
      "002415": "海康威视",
      "002460": "赣锋锂业",
      "002594": "比亚迪",
      "300059": "东方财富",
      "300751": "迈瑞医疗",
      "600000": "浦发银行",
      "600016": "民生银行",
      "600028": "中国石化",
      "600030": "中信证券",
      "600050": "中国联通",
      "600104": "上海汽车",
      "600196": "复星医药",
      "600271": "航天信息",
      "600309": "万华化学",
      "600438": "通威股份",
      "600585": "海螺水泥",
      "600690": "青岛海尔"
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
      width: 100,
    },
    {
      title: "当前价格",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : ''),
      sorter: (a: StockData, b: StockData) => b.price - a.price,
    },
    { title: "公司名称", dataIndex: "name", key: "name", width: 150 },
    {
      title: "涨跌幅",
      dataIndex: "changesPercentage",
      key: "changesPercentage",
      width: 100,
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) + "%" : ''),
      sorter: (a: StockData, b: StockData) => b.changesPercentage - a.changesPercentage,
    },
    {
      title: "市值",
      dataIndex: "marketCap",
      key: "marketCap",
      width: 100,
      render: (text: number) => (text !== undefined && text !== null ? (text / 1000000).toFixed(2) + "M" : ''),
      sorter: (a: StockData, b: StockData) => b.marketCap - a.marketCap,
    },
    {
      title: "涨跌价格",
      dataIndex: "change",
      key: "changes",
      width: 100,
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : ''),
      sorter: (a: StockData, b: StockData) => b.change - a.change,
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
          style={{ marginRight: isMobile ? "0" : "30px", marginTop: isMobile ? "0" : "30px" }}
        >
          {loading ? "加载中..." : "刷新行情"}
        </Button>
      </div>
      <div className="table-hscroll">
        <Table
          columns={columns}
          dataSource={(() => {
            const startIndex = (current - 1) * pageSize;
            const endIndex = current * pageSize;
            const currentPageData = stockPrice.slice(startIndex, endIndex);
            const paddedData = [...currentPageData];
            while (paddedData.length < pageSize) {
              paddedData.push({} as StockData);
            }
            return paddedData;
          })()}
          pagination={false}
          rowKey={(record: StockData, index: number) => record.symbol || index}
        />
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
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