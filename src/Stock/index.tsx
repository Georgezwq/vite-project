import { Button, Grid, Input, Modal, Table } from "antd";
import { useEffect, useRef, useState } from "react";
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
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [stockPrice, setStockPrice] = useState<USQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, onOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [contextStock, setContextStock] = useState<string | null>(null);
  const [showMoreFunction, setShowMoreFunction] = useState(false);

  // 移除未使用的分页状态，避免构建报错

  const symbols = ["AAPL", "BRK B", "FFAI", "GME", "NIO", "TSLA"];
  const API = "https://raspy-bush-6713.zangjichao.workers.dev";

  const onAdd = async () => {
    const symbol = inputValue.trim().toUpperCase();
    if (!symbol) return alert("请输入股票代码");

    try {
      if (stockPrice.some((s) => s.symbol === symbol)) {
        return alert(`${symbol} 已在列表中！`);
      }

      const res = await fetch(`${API}/add?symbol=${symbol}`);

      if (!res.ok) {
        const msg = await res.text();
        return alert(`添加失败：${msg}`);
      }

      const text = await res.text();
      console.log(text);
      await fetchPrice();
      setInputValue("");
      onOpen(false);
    } catch (err) {
      console.error(err);
      alert("网络错误或后端问题，请稍后再试");
    }
  };

  const fetchPrice = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://raspy-bush-6713.zangjichao.workers.dev/stocks",
      );
      const data = await res.json();
      setStockPrice(Array.isArray(data) ? (data as USQuote[]) : []);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
      const nameMap: Record<string, string> = {
        AAPL: "Apple Inc.",
        BRK_B: "Berkshire Hathaway Inc. Class B",
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
        return {
          symbol: s,
          price,
          name: nameMap[s] || s,
          changesPercentage,
          marketCap,
          change,
        };
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
      title: "股票代码",
      dataIndex: "symbol",
      key: "symbol",
      fixed: "left" as const,
      className: "fix-left-white",
    },
    {
      title: "价格",
      key: "price",
      dataIndex: "price",
      render: (text: number) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "涨跌幅",
      dataIndex: "changesPercentage",
      render: (text: number) => `${text}%`,
    },
    // {
    //   title: "最新",
    //   minWidth: 50,
    //   dataIndex: "price",
    //   key: "price",
    //   render: (text: any) => text.toFixed(2),
    //   sorter: (a: any, b: any) => b.price - a.price,
    // },
    // { title: "公司全名", dataIndex: "name", key: "name" },
    // {
    //   title: "涨跌幅",
    //   minWidth: 60,
    //   dataIndex: "changesPercentage",
    //   key: "changesPercentage",
    //   render: (text: any) => text.toFixed(2),
    //   sorter: (a: any, b: any) => b.changesPercentage - a.changesPercentage,
    // },
    // {
    //   title: "市值",
    //   dataIndex: "marketCap",
    //   key: "marketCap",
    //   render: (text: any) => {
    //     if (text >= 1e12) return (text / 1e12).toFixed(2) + "T";
    //     if (text >= 1e9) return (text / 1e9).toFixed(2) + "B";
    //     if (text >= 1e6) return (text / 1e6).toFixed(2) + "M";
    //     if (text >= 1e3) return (text / 1e3).toFixed(2) + "K";
    //     return text.toString();
    //   },
    //   sorter: (a: any, b: any) => b.marketCap - a.marketCap,
    // },
    // {
    //   title: "涨跌价格",
    //   dataIndex: "change",
    //   key: "change",
    //   render: (text: any) => text.toFixed(2),
    //   sorter: (a: any, b: any) => b.change - a.change,
    // },
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
        <Button onClick={() => onOpen(true)}>添加股票</Button>
      </div>
      <div className="table-hscroll">
        <Table
          columns={columns}
          dataSource={stockPrice}
          rowKey="symbol"
          pagination={false}
          onRow={(record) => ({
            // 开始按压
            onTouchStart: () => {
              longPressTimer.current = setTimeout(() => {
                setContextStock(record.symbol);
                setShowMoreFunction(true);
              }, 600);
            },
            onTouchEnd: () => {
              if (longPressTimer.current !== null) {
                clearTimeout(longPressTimer.current!);
              }
            },
            onTouchMove: () => {
              if (longPressTimer.current !== null) {
                clearTimeout(longPressTimer.current!);
              }
            },
            onContextMenu: (e) => {
              e.preventDefault();
              setContextStock(record.symbol);
              setShowMoreFunction(true);
            },
          })}
        />
      </div>
      <Modal open={open} onCancel={() => onOpen(false)} onOk={onAdd}>
        <div>请输入股票代码1</div>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="例如：AAPL"
        />
      </Modal>
      <Modal
        open={showMoreFunction}
        footer={null}
        closable={false}
        maskClosable={true}
        onCancel={() => setShowMoreFunction(false)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div className="delete-modal-area">
            <div className="iconStyle">⬆️</div> 置顶
          </div>
          <div className="delete-modal-area">
            <div className="iconStyle">⬇️</div> 置底
          </div>
          <div className="delete-modal-area">
            <div
              className="iconStyle"
              onClick={async () => {
                await fetch(`${API}/delete?symbol=${contextStock}`);
                await fetchPrice();
                setShowMoreFunction(false);
              }}
            >
              ❌
            </div>{" "}
            删除
          </div>
          <div className="delete-modal-area">
            <div className="iconStyle">🔄</div> 取消置顶
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stock;
