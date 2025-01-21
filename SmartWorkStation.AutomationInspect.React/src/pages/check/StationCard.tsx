import { Card, Space, Tag } from 'antd'
import { Station } from '../../stores/stationStore'

const StationCard = ({
  station,
  onClick,
  selected,
}: {
  station: Station
  onClick: () => void
  selected: boolean
}) => {
  const description = (
    <Space wrap>
      <Tag color='cyan'>
        {station.ip}:{station.port}
      </Tag>
      <Tag color='cyan'>扭矩: {station.targetTorque} N.m</Tag>
      {station.checking && <Tag color='success'>自动校验</Tag>}
      {station.byDuration && <Tag color='orange'>{station.duration} 分钟</Tag>}
    </Space>
  )
  return (
    <Card
      className={`w-full ${selected ? 'border-1 border-blue-400' : ''} `}
      onClick={onClick}
      bordered={selected}
    >
      <Card.Meta title={station.name} description={description} />
    </Card>
  )
}

export default StationCard
