import { Card, Descriptions, Spin, Statistic, Table, Tabs, Tag } from 'antd';
import type { TableProps } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

interface StockData {
  name: string;
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  change: number;
  changePercent: number;
}

interface KlineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  changePercent: number;
}

export default function AStock() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StockData | null>(null);
  const [history, setHistory] = useState<KlineData[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始请求数据...');
        
        // 1. 获取实时数据
        const quoteRes = await fetch(
          '/api/eastmoney/api/qt/stock/get?secid=105.TSLA&fields=f43,f44,f45,f46,f58,f60,f57,f169,f170'
        );
        const quoteJson = await quoteRes.json();

        // 2. 获取历史 K 线数据 (最近 50 天)
        // klt=101 (日K), lmt=50 (最近50条)
        // fields2: f51(日期), f52(开盘), f53(收盘), f54(最高), f55(最低), f56(成交量), f57(成交额), f58(振幅), f59(涨跌幅), f60(涨跌额), f61(换手率)
        const historyRes = await fetch(
          '/api/eastmoney/kline/api/qt/stock/kline/get?secid=105.TSLA&klt=101&fqt=1&lmt=50&end=20990101&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f59'
        );
        const historyJson = await historyRes.json();
        
        if (quoteJson.data) {
          const d = quoteJson.data;
          setData({
            name: d.f58,
            symbol: d.f57,
            price: d.f43 / 1000,
            open: d.f46 / 1000,
            high: d.f44 / 1000,
            low: d.f45 / 1000,
            prevClose: d.f60 / 1000,
            change: d.f169 / 1000,
            changePercent: d.f170 / 100 
          });
        } else {
          setError('未获取到数据');
        }

        if (historyJson.data && historyJson.data.klines) {
          // 解析 K 线字符串数组: "2023-10-27,205.10,207.30,210.00,203.00,1000000,1.5"
          const klines = historyJson.data.klines.map((item: string) => {
            const parts = item.split(',');
            return {
              date: parts[0],
              open: parseFloat(parts[1]),
              close: parseFloat(parts[2]),
              high: parseFloat(parts[3]),
              low: parseFloat(parts[4]),
              volume: parseFloat(parts[5]),
              changePercent: parseFloat(parts[6])
            };
          }).reverse(); // 倒序，最新的在前面
          setHistory(klines);
        }

      } catch (err) {
        console.error(err);
        setError('请求出错');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spin tip="加载中..." style={{ margin: 20 }} />;
  if (error) return <Card title="错误">{error}</Card>;
  if (!data) return null;

  const isUp = data.change >= 0;
  const color = isUp ? '#cf1322' : '#3f8600'; 

  const columns: TableProps<KlineData>['columns'] = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 110 },
    { 
      title: '收盘价', 
      dataIndex: 'close', 
      key: 'close', 
      render: (val: number) => <strong>${val.toFixed(2)}</strong> 
    },
    { 
      title: '涨跌', 
      dataIndex: 'changePercent', 
      key: 'changePercent',
      render: (val: number) => {
        const isUp = val >= 0;
        const color = isUp ? '#cf1322' : '#3f8600';
        return (
          <Tag color={isUp ? 'error' : 'success'} style={{ fontWeight: 'bold' }}>
            {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(val).toFixed(2)}%
          </Tag>
        );
      }
    },
    { 
      title: '成交量', 
      dataIndex: 'volume', 
      key: 'volume', 
      render: (val: number) => {
        // 格式化成交量，例如 12345678 -> 1234.57万 或 12.35M
        if (val > 100000000) return `${(val / 100000000).toFixed(2)}亿`;
        if (val > 10000) return `${(val / 10000).toFixed(2)}万`;
        return val;
      }
    },
    { title: '开盘', dataIndex: 'open', key: 'open', render: (val: number) => val.toFixed(2), responsive: ['md'] },
    { title: '最高', dataIndex: 'high', key: 'high', render: (val: number) => val.toFixed(2), responsive: ['md'] },
    { title: '最低', dataIndex: 'low', key: 'low', render: (val: number) => val.toFixed(2), responsive: ['md'] },
  ];

  return (
    <Card title={`${data.name} (${data.symbol}) - 最近50日行情`} style={{ maxWidth: 1000, margin: '20px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Statistic
          title="当前价格"
          value={data.price}
          precision={2}
          valueStyle={{ color: color, fontSize: 32, fontWeight: 'bold' }}
          prefix={isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          suffix="$"
        />
        <div style={{ marginLeft: 40 }}>
            <Statistic
              title="涨跌幅"
              value={data.changePercent}
              precision={2}
              valueStyle={{ color: color }}
              prefix={isUp ? '+' : ''}
              suffix="%"
            />
             <Statistic
              title="涨跌额"
              value={data.change}
              precision={2}
              valueStyle={{ color: color }}
              prefix={isUp ? '+' : ''}
            />
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={[
        {
          key: '1',
          label: '基本信息',
          children: (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="今开">{data.open.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="昨收">{data.prevClose.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="最高">{data.high.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="最低">{data.low.toFixed(2)}</Descriptions.Item>
            </Descriptions>
          )
        },
        {
          key: '2',
          label: '最近5日行情',
          children: (
            <Table
              dataSource={history}
              columns={columns}
              rowKey="date"
              pagination={false}
              size="small"
            />
          )
        }
      ]} />
    </Card>
  );
}
