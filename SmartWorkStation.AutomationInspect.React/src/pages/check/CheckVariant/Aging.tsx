import { Card, Table } from 'antd'
import useCheckStatus from '../../../hooks/useCheckStatus'
import { useContext } from 'react'
import { StationContext } from '../../../hooks/useStationContext'

const Aging = () => {
  var { station } = useContext(StationContext)
  if (!station)
    return (
      <Card>
        <h1>请选择一个工位</h1>
      </Card>
    )
  const { agingPoints } = useCheckStatus(station.id)
  console.log(agingPoints)

  const columns = [
    {
      title: '序号',
      dataIndex: 'Index',
      key: 'index',
    },
    {
      title: '电批扭矩',
      dataIndex: 'ScrewTorque',
      key: 'screwTorque',
      render: (torque: number) => {
        return (torque / 100.0).toFixed(2)
      },
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
        dataSource={agingPoints}
        pagination={{
          pageSize: 10,
        }}
      />
    </Card>
  )
}

export default Aging
