import { Button, Grid, Table, Row, Col, Select } from "antd";
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

const AStockOld = () => {
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
  
  const fetchPrice = async () => {
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
        const rawData = (window as unknown as Record<string, string | undefined>)[globalVarName]; // 使用更精确的类型断言替代 any
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
      title: "公司信息",
      key: "companyInfo",
      fixed: "left" as const,
      width: isMobile ? 95 : 110,
      render: (_, record: StockData) => (
        <div style={{ lineHeight: '1.2', paddingLeft: isMobile ? '2px' : '4px' }}>
          <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '1px', color: '#1a365d' }}>
            {record.name}
          </div>
          <div style={{ fontSize: '9px', color: '#4a5568', opacity: 0.8 }}>
            {record.symbol}
          </div>
        </div>
      ),
    },
    {
      title: "当前价格",
      dataIndex: "price",
      key: "price",
      width: isMobile ? 80 : 90,
      render: (text: number) => (
        <span style={{ fontWeight: 500, fontSize: '13px' }}>
          {text !== undefined && text !== null ? `¥${text.toFixed(2)}` : ''}
        </span>
      ),
      sorter: (a: StockData, b: StockData) => b.price - a.price,
    },
    {
      title: "涨跌幅",
      dataIndex: "changesPercentage",
      key: "changesPercentage",
      width: isMobile ? 75 : 85,
      render: (text: number) => {
        if (text === undefined || text === null) return '';
        const color = text >= 0 ? '#ff4d4f' : '#52c41a';
        const bgColor = text >= 0 ? 'rgba(255, 77, 79, 0.1)' : 'rgba(82, 196, 26, 0.1)';
        const prefix = text >= 0 ? '+' : '';
        return (
          <span style={{ 
            color, 
            backgroundColor: bgColor,
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            {prefix}{text.toFixed(2)}%
          </span>
        );
      },
      sorter: (a: StockData, b: StockData) => b.changesPercentage - a.changesPercentage,
    },
    {
      title: "涨跌额",
      dataIndex: "change",
      key: "change",
      width: isMobile ? 70 : 80,
      render: (text: number) => {
        if (text === undefined || text === null) return '';
        const color = text >= 0 ? '#ff4d4f' : '#52c41a';
        const prefix = text >= 0 ? '+' : '';
        return (
          <span style={{ color, fontSize: '12px', fontWeight: 500 }}>
            {prefix}{text.toFixed(2)}
          </span>
        );
      },
      sorter: (a: StockData, b: StockData) => b.change - a.change,
    },
    {
      title: "市值",
      dataIndex: "marketCap",
      key: "marketCap",
      width: isMobile ? 80 : 90,
      render: (text: number) => {
        if (text === undefined || text === null || text === 0) return '';
        let displayText = '';
        if (text >= 1e12) displayText = (text / 1e12).toFixed(1) + "万亿";
        else if (text >= 1e8) displayText = (text / 1e8).toFixed(0) + "亿";
        else if (text >= 1e4) displayText = (text / 1e4).toFixed(0) + "万";
        else displayText = text.toString();
        
        return (
          <span style={{ fontSize: '12px', color: '#4a5568' }}>
            {displayText}
          </span>
        );
      },
      sorter: (a: StockData, b: StockData) => b.marketCap - a.marketCap,
    }
  ];

  return (
    <div className="astock-container">
      <Row className="astock-header" justify="center" align="middle" style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
          <h2 className="astock-title" style={{ margin: 0 }}>中国A股市场</h2>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12} style={{ textAlign: isMobile ? "center" : "right", marginTop: isMobile ? "10px" : "0" }}>
          <Button className="refresh-btn" onClick={fetchPrice} loading={loading}>
            {loading ? "加载中..." : "刷新行情"}
          </Button>
        </Col>
      </Row>
      <div className="table-hscroll">
        <Table
          className="astock-table"
          columns={columns}
          dataSource={(() => {
            const startIndex = (current - 1) * pageSize;
            const endIndex = current * pageSize;
            const currentPageData = stockPrice.slice(startIndex, endIndex);
            const paddedData = [...currentPageData];
            while (paddedData.length < pageSize) {
              paddedData.push({
                symbol: `empty-${paddedData.length}`,
                name: '',
                price: 0,
                changesPercentage: 0,
                marketCap: 0,
                change: 0,
              });
            }
            return paddedData;
          })()}
          pagination={false}
          rowKey={(record: StockData, index?: number) => record.symbol || String(index)}
          scroll={{ x: isMobile ? 320 : 365 }}
          size="middle"
        />
      </div>
      <Row justify="center" style={{ marginTop: 8 }}>
        <Col>
          <div className="custom-pagination">
            {/* 自定义分页器 */}
            <div className="custom-pagination-controls">
              {/* 上一页按钮 */}
              <Button
                size="small"
                disabled={current === 1}
                onClick={() => setCurrent(current - 1)}
                className="custom-pagination-btn"
              >
                ‹
              </Button>
              
              {/* 当前页显示 */}
              <span className="custom-pagination-current">
                {current}
              </span>
              
              {/* 下一页按钮 */}
              <Button
                size="small"
                disabled={current === Math.ceil(stockPrice.length / pageSize)}
                onClick={() => setCurrent(current + 1)}
                className="custom-pagination-btn"
              >
                ›
              </Button>
            </div>
            
            {/* 页码选择下拉菜单 */}
            <Select
              value={current}
              onChange={(value) => setCurrent(value)}
              size="small"
              className="custom-pagination-select"
              style={{ minWidth: '80px' }}
              placeholder="跳转"
            >
              {Array.from({ length: Math.ceil(stockPrice.length / pageSize) }, (_, i) => i + 1).map(page => (
                <Select.Option key={page} value={page}>
                  第 {page} 页
                </Select.Option>
              ))}
            </Select>
            
            {/* 总页数显示 */}
            <span className="custom-pagination-info">
              共 {Math.ceil(stockPrice.length / pageSize)} 页
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AStockOld;
