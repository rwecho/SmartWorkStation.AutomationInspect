import { Card, Table } from 'antd'
import { useCheckingStore } from '../../../stores/checkingStore'

const Aging = () => {
  const { agingItems } = useCheckingStore()

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
        dataSource={agingItems}
        pagination={{
          pageSize: 10,
        }}
      />
    </Card>
  )
}

export default Aging
