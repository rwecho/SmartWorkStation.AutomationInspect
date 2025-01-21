import { Alert, Breadcrumb, Button, Space, message } from 'antd'
import { finishChecking } from '../../../services/checking'
import RealScrewStatus from './RealScrewStatus'
import RealTorqueMeter from './RealTorqueMeter'
import { useContext } from 'react'
import { StationContext } from '../../../hooks/useStationContext'
import useCheckStatus from '../../../hooks/useCheckStatus'

const Error = () => {
  const { station } = useContext(StationContext)
  if (!station) {
    return <div>未选择工作站</div>
  }
  const { error } = useCheckStatus(station.id)
  const handleReset = async () => {
    try {
      await finishChecking(station.id)

      message.info('复位成功')
    } catch (error) {
      message.error('复位失败')
    }
  }
  return (
    <Space direction='vertical' className='w-full'>
      <Breadcrumb>
        <Breadcrumb.Item>{station.name}</Breadcrumb.Item>
      </Breadcrumb>
      <div className='flex justify-center my-8'>
        <Alert message={error} type='error' showIcon></Alert>
        <Button size='large' danger onClick={handleReset} className='w-64 h-16'>
          复位
        </Button>
      </div>
      <RealScrewStatus id={station.id} readonly={false}></RealScrewStatus>
      <RealTorqueMeter id={station.id} readonly={false}></RealTorqueMeter>
    </Space>
  )
}

export default Error
