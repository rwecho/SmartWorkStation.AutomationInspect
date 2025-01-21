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
      title: '点测扭矩(N.m)',
      dataIndex: 'point',
      key: 'point',
    },
    {
      title: '电批扭矩(N.m)',
      dataIndex: 'screwTorque',
      key: 'screwTorque',
      render: (torque: number) => {
        return (torque / 100.0).toFixed(2)
      },
    },
    {
      title: '测量仪扭矩(N.m)',
      dataIndex: 'meterTorque',
      key: 'meterTorque',
    },
  ]
  return (
    <Card>
      <Table
        columns={columns}
        dataSource={checkingPoints.map((point, index) => ({
          key: index,
          ...point,
        }))}
        rowKey={(record) => record.key}
        pagination={{
          pageSize: 10,
        }}
      />
    </Card>
  )
}

export default CheckPoint
