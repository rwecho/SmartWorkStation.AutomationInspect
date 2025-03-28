import {
  Button,
  Card,
  DatePicker,
  Space,
  Table,
  message,
  Input,
  Tabs,
} from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { CheckRecord } from "../../types/checkRecord";
import dayjs from "dayjs";
import { getAsync } from "../../services/fetch";
const { RangePicker } = DatePicker;

const HistoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckRecord[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(3, "day"),
    dayjs(),
  ]);
  const [searchId, setSearchId] = useState<string>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "斜率(%)",
      dataIndex: "kp",
      key: "kp",
      render: (value: number) => (value ? value * 100 : 0).toFixed(3),
    },
    {
      title: "截距",
      dataIndex: "b",
      key: "b",
      render: (value: number) => (value ? value * 10.0 : 0).toFixed(3),
    },
  ];

  // 校验数据子表格列定义
  const checkPointColumns = [
    { title: "目标扭矩", dataIndex: "point", key: "point" },
    { title: "序号", dataIndex: "index", key: "index" },
    { title: "电批扭矩", dataIndex: "screwTorque", key: "screwTorque" },
    { title: "扭矩测量仪扭矩", dataIndex: "meterTorque", key: "meterTorque" },
  ];

  // 老化数据子表格列定义
  const agingDataColumns = [
    { title: "序号", dataIndex: "index", key: "index" },
    { title: "电批扭矩", dataIndex: "screwTorque", key: "screwTorque" },
    { title: "扭矩测量仪扭矩", dataIndex: "meterTorque", key: "meterTorque" },
  ];

  // 展开行渲染函数
  const expandedRowRender = (record: CheckRecord) => {
    const items = [
      {
        key: "1",
        label: "校验数据",
        children: (
          <Table
            columns={checkPointColumns}
            dataSource={record.pointData}
            pagination={false}
            size="small"
          />
        ),
      },
      {
        key: "2",
        label: "老化数据",
        children: (
          <Table
            columns={agingDataColumns}
            dataSource={record.agingData}
            pagination={false}
            size="small"
          />
        ),
      },
    ];

    return <Tabs items={items} />;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchId) {
        query.append("id", searchId);
      }
      if (dateRange) {
        query.append("startTime", dateRange[0].startOf("day").toISOString());
        query.append("endTime", dateRange[1].endOf("day").toISOString());
      }

      const queryString = query.toString();

      const reports = await getAsync<CheckRecord[]>(
        "/api/reports?" + queryString
      );
      if (!reports) {
        message.error("没有数据");
        return;
      }
      setData(reports);
    } catch (error) {
      message.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card className="m-4">
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="请输入工作台ID"
          style={{ width: 200 }}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <RangePicker
          value={dateRange}
          onChange={(dates) =>
            setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
          }
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Card>
  );
};

export default HistoryPage;
