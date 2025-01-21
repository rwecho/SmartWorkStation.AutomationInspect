import { Card, Table } from 'antd'
import useCheckStatus from '../../../hooks/useCheckStatus'
import { useContext } from 'react'
import { StationContext } from '../../../hooks/useStationContext'

const CheckPoint = () => {
  const { station } = useContext(StationContext)

  if (!station) {
    return <div>未选择工作站</div>
  }

  const { checkingPoints } = useCheckStatus(station.id)

  const columns = [
    {
      title: '点测扭矩',
      dataIndex: 'Point',
      key: 'point',
    },
    {
      title: '电批扭矩',
      dataIndex: 'ScrewTorque',
      key: 'screwTorque',
    },
    {
      title: '测量仪扭矩',
      dataIndex: 'MeterTorque',
      key: 'meterTorque',
    },
  ]
  return (
    <Card>
      <Table
        columns={columns}
        dataSource={checkingPoints}
        pagination={{
          pageSize: 10,
        }}
      />
    </Card>
  )
}

export default CheckPoint
