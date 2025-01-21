import { Space, Button, Popconfirm, Tabs, message, Statistic } from 'antd'
import { useContext } from 'react'
import { cancelChecking } from '../../../services/checking'
import { StationContext } from '../../../hooks/useStationContext'
import RealTorqueMeter from './RealTorqueMeter'
import RealScrewStatus from './RealScrewStatus'
import { CheckingStatus } from '../../../stores/checkingStore'
import Aging from './Aging'
import CheckPoint from './CheckPoint'
import useCheckStatus from '../../../hooks/useCheckStatus'
import Chart from './Chart'

const CheckingChart = () => {
  const { station } = useContext(StationContext)

  if (!station) {
    return <div>未选择工作站</div>
  }

  const handleCancel = async () => {
    try {
      await cancelChecking(station.id)
      message.info('停止成功')
    } catch {
      message.error('停止失败')
    }
  }
  const { status, screwFactor, agingPoints, checkingPoints } = useCheckStatus(
    station.id
  )

  return (
    <Space direction='vertical' size='large' className='w-full '>
      <Chart></Chart>
      <Space size={'large'} className='w-full justify-center my-8'>
        {screwFactor && (
          <>
            <Statistic title='斜率' value={screwFactor?.kp}></Statistic>
            <Statistic title='截距' value={screwFactor?.b}></Statistic>
          </>
        )}

        {status >= CheckingStatus.checking && (
          <>
            <Statistic
              title='校验数据'
              value={checkingPoints.length}
            ></Statistic>
          </>
        )}
        {status >= CheckingStatus.aging && (
          <>
            <Statistic title='老化数据' value={agingPoints.length}></Statistic>
          </>
        )}

        <Popconfirm
          title='停止校验'
          description='确定停止校验吗？'
          okText='是'
          cancelText='否'
          onConfirm={handleCancel}
        >
          <Button type='primary' danger size='large' className='w-64 h-16'>
            停止
          </Button>
        </Popconfirm>
      </Space>
      <RealScrewStatus id={station.id} readonly></RealScrewStatus>
      <RealTorqueMeter id={station.id} readonly></RealTorqueMeter>
    </Space>
  )
}

const Checking = ({ status }: { status: CheckingStatus }) => {
  let tabItems = [
    {
      key: '1',
      label: '拧紧曲线',
      children: <CheckingChart></CheckingChart>,
    },
  ]

  if (status >= CheckingStatus.checking) {
    tabItems.push({
      key: 'checking',
      label: '校验数据',
      children: <CheckPoint></CheckPoint>,
    })
  }

  if (status >= CheckingStatus.aging) {
    tabItems.push({
      key: 'aging',
      label: '老化数据',
      children: <Aging></Aging>,
    })
  }

  return <Tabs defaultActiveKey='1' items={tabItems}></Tabs>
}

export default Checking
