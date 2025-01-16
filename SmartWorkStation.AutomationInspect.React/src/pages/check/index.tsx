import { Layout, Space, theme } from "antd"
import { useStationStore } from "../../stores/stationStore"
import StationCard from "./StationCard"
import { useEffect, useState } from "react"
import Check from "./Check"

const CheckPage = () => {
  const { stations, load } = useStationStore()

  const [selectedId, setSelectedId] = useState<number>()

  useEffect(() => {
    load()
  }, [load])

  const {
    token: { colorBgContainer },
  } = theme.useToken()
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
        style={{ background: colorBgContainer }}
        className="rounded-md p-4"
      >
        {/* Sidebar content */}
        <Space direction="vertical" className="w-full">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onClick={() => setSelectedId(station.id)}
              selected={selectedId === station.id}
            ></StationCard>
          ))}
        </Space>
      </Layout.Sider>
    </Layout>
  )
}
export default CheckPage
