import { useMemo } from "react";
import { Grid, Segmented, Button, Input } from "antd";
import "./index.css";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;

// interface QuoteItem {
//   name: string;
//   code: string;
//   price: number;
//   change: number; // price change
//   percent: number; // percent change
// }

const EastMoneyMobile = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  // 示例数据（后续可替换为真实接口数据）
  // const quotes = useMemo<QuoteItem[]>(
  //   () => [
  //     { name: "上证指数", code: "000001", price: 3021.55, change: 12.34, percent: 0.41 },
  //     { name: "深证成指", code: "399001", price: 9621.12, change: -21.08, percent: -0.22 },
  //     { name: "创业板指", code: "399006", price: 1875.43, change: 5.67, percent: 0.30 },
  //     { name: "沪深300", code: "000300", price: 3567.89, change: -8.12, percent: -0.23 },
  //   ],
  //   []
  // );

  const features = useMemo(
    () => [
      { key: "global", label: "全球指数", icon: "🌍" },
      { key: "flow", label: "资金流向", icon: "💧" },
      { key: "theme", label: "热点题材", icon: "🔥" },
      { key: "ipo", label: "新股申购", icon: "🪙" },
      { key: "world", label: "全球期指", icon: "📈" },
      { key: "data", label: "数据中心", icon: "📊" },
      { key: "hk", label: "沪深港通", icon: "🇭🇰" },
      { key: "fund", label: "优选基金", icon: "🏦" },
      { key: "main", label: "主力建仓", icon: "🏗️" },
      { key: "more", label: "更多", icon: "➕" },
    ],
    [],
  );

  const feed = useMemo(
    () => [
      {
        id: 1,
        title: "统计局：10月份CPI同比上涨0.2% PPI环比转涨",
        tag: "要闻",
        time: "2分钟前",
        comments: 311,
      },
      {
        id: 2,
        title: "半导体龙头回应：扩产储备芯片产能，供需改善",
        tag: "热门",
        time: "8分钟前",
        comments: 1024,
      },
      {
        id: 3,
        title: "新能源车企发布销量快报，环比增长显著",
        tag: "发现",
        time: "12分钟前",
        comments: 508,
      },
    ],
    [],
  );

  return (
    <div className="em-container">
      {/* 顶部（搜索 + 快捷入口） */}
      <div className="em-top">
        <div className="em-top-bar">
          <div className="em-top-left">📱</div>
          <div className="em-top-search">
            <Input
              size="small"
              placeholder="怎么选股？问问妙想！"
              prefix={<span style={{ marginRight: 4 }}>🔍</span>}
            />
          </div>
          <div className="em-top-right">🔔</div>
        </div>
        <div className="em-top-shortcuts">
          {[
            { k: "hk", t: "港美" },
            { k: "fut", t: "期货" },
            { k: "fund", t: "基金" },
            { k: "magic", t: "妙想" },
          ].map((s) => (
            <div
              key={s.k}
              className="em-shortcut"
              onClick={() => {
                if (s.k === "hk") {
                  navigate("/home/stock");
                }
              }}
            >
              <div className="em-shortcut-icon">⭐</div>
              <div className="em-shortcut-text">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 开户横幅 */}
      <div className="em-banner">
        <div className="em-banner-title">你还没股票账户？</div>
        <div className="em-banner-sub">开户享更低佣金</div>
        <Button size="small" className="em-banner-btn">
          立即办理
        </Button>
      </div>

      {/* 功能网格 */}
      <div className="em-grid">
        {features.map((f) => (
          <div key={f.key} className="em-grid-item">
            <div className="em-grid-icon">{f.icon}</div>
            <div className="em-grid-text">{f.label}</div>
          </div>
        ))}
      </div>

      {/* 推荐卡片行 */}
      <div className="em-cards">
        <div className="em-card orange">
          <div className="em-card-title">新人7天礼 🎁</div>
          <div className="em-card-sub">限时礼包待领取</div>
          <Button size="small" className="em-card-btn">
            立即领取
          </Button>
        </div>
        <div className="em-card blue">
          <div className="em-card-title">特色功能 玩赚股市</div>
          <div className="em-card-sub">百万股民正在使用</div>
          <Button size="small" className="em-card-btn">
            立即探索
          </Button>
        </div>
      </div>
      <div className="em-dots">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>

      {/* 资讯 Tabs 与信息流 */}
      <div className="em-tabs">
        <Segmented
          size={isMobile ? "small" : "middle"}
          className="em-segmented"
          options={["发现", "要闻", "热门", "自选", "关注", "7x24"]}
          defaultValue="发现"
        />
      </div>

      <div className="em-feed">
        {feed.map((item) => (
          <div key={item.id} className="em-feed-item">
            <div className="em-feed-title">{item.title}</div>
            <div className="em-feed-meta">
              <span className="em-tag">{item.tag}</span>
              <span className="em-time">{item.time}</span>
              <span className="em-comments">{item.comments}评</span>
            </div>
          </div>
        ))}
      </div>

      {/* 底部工具栏（移动端） */}
      <div className="em-footer">
        <div className="em-footer-item active">🏠 首页</div>
        <div className="em-footer-item">📊 行情</div>
        <div className="em-footer-item">📰 资讯</div>
        <div
          className="em-footer-item"
          onClick={() => navigate("/home/astock")}
        >
          💼 行情
        </div>
        <div className="em-footer-item">👤 我的</div>
      </div>
    </div>
  );
};

export default EastMoneyMobile;
