import { Layout, Space, theme } from "antd";
import { useStationStore } from "../../stores/stationStore";
import StationCard from "./StationCard";
import { useEffect, useState } from "react";
import Check from "./Check";
import { useShallow } from "zustand/shallow";

const CheckPage = () => {
  const { stations, load } = useStationStore(
    useShallow((state) => {
      return { stations: state.stations, load: state.load };
    })
  );

  const [selectedId, setSelectedId] = useState<number>();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (stations.length > 0) {
      setSelectedId(stations[0].id);
    }
  }, [stations]);

  useEffect(() => {
    load();
  }, [load]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content
        style={{
          background: colorBgContainer,
        }}
        className="mx-1 rounded-md p-4"
      >
        {!selectedId && (
          <div className="text-center text-2xl">请选择工作站</div>
        )}

        {selectedId && (
          <Check station={stations.find((t) => t.id === selectedId)}></Check>
        )}
      </Layout.Content>
      <Layout.Sider
        width={200}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: colorBgContainer }}
        className="rounded-md"
        theme="light"
      >
        <Space
          direction="vertical"
          className={`w-full py-2 ${collapsed ? "px-1 " : "p-4"}`}
        >
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onClick={() => {
                setSelectedId(station.id);
              }}
              selected={selectedId === station.id}
              small={collapsed}
            ></StationCard>
          ))}
        </Space>
      </Layout.Sider>
    </Layout>
  );
};
export default CheckPage;
