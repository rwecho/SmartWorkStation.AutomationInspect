import { Button, Card, Space, Tag, message } from 'antd'
import { useEffect } from 'react'
import './RealScrewStatus.css'
import { useScrewStore } from '../../../stores/screwStore'
import {
  getScrewStatus,
  lock,
  reverseScrewing,
  screwing,
  syncTime,
  unlock,
} from '../../../services/screw'
import { fullifyUrl } from '../../../services/fetch'

enum ScrewStatusEnum {
  Ready = 0,
  Run = 1,
  OK = 2,
  NG = 3,
  Warning = 4,
}

const parseStatus = (status: number) => {
  switch (status) {
    case ScrewStatusEnum.Ready:
      return '准备'
    case ScrewStatusEnum.Run:
      return '运行'
    case ScrewStatusEnum.OK:
      return 'OK'
    case ScrewStatusEnum.NG:
      return 'NG'
    case ScrewStatusEnum.Warning:
      return '警告'
    default:
      return '未知'
  }
}

const RealScrewStatus = ({
  id,
  readonly = false,
}: {
  id: number
  readonly: boolean
}) => {
  const { screwStatus, setScrewStatus } = useScrewStore()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const screwStatus = await getScrewStatus(id)
        setScrewStatus(screwStatus)
      } catch (error) {
        message.error('无法连接到螺丝机')
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [id, setScrewStatus])

  if (!screwStatus) {
    return <></>
  }

  const handleScrewing = async () => {
    try {
      await screwing(id)
      message.success('正转成功')
    } catch (error) {
      message.error('正转失败')
    }
  }

  const handleReverseScrewing = async () => {
    try {
      await reverseScrewing(id)
      message.success('反转成功')
    } catch (error) {
      message.error('反转失败')
    }
  }

  const handleSyncTime = async () => {
    try {
      await syncTime(id)
      message.success('同步时间成功')
    } catch (error) {
      message.error('同步时间失败')
    }
  }

  const handleLock = async () => {
    try {
      await lock(id)
      message.success('锁定成功')
    } catch (error) {
      message.error('锁定失败')
    }
  }

  const handleUnlock = async () => {
    try {
      await unlock(id)
      message.success('解锁成功')
    } catch (error) {
      message.error('解锁失败')
    }
  }

  return (
    <Card>
      {screwStatus && (
        <Space direction='vertical' size='large'>
          <table>
            <tbody>
              <tr>
                <td>程序号</td>
                <td>{screwStatus.pset}</td>

                <td>扭矩</td>
                <td>
                  {screwStatus.torque / 100.0}
                  <span className='text-sm text-gray-400'>N.M</span>
                </td>

                <td>转速</td>
                <td>
                  {screwStatus.rpm}{' '}
                  <span className='text-sm text-gray-400'>rpm</span>
                </td>

                <td>锁定标志</td>
                <td>
                  <Tag color='orange'>
                    {screwStatus.lockFlag === 1 ? '锁定' : '未锁定'}
                  </Tag>
                </td>
              </tr>

              <tr>
                <td>角度</td>
                <td>
                  {screwStatus.angle}
                  <span className='text-sm text-gray-400'>°</span>
                </td>

                <td>状态</td>
                <td>{parseStatus(screwStatus.status)}</td>

                <td>过程号</td>
                <td>{screwStatus.procedureNumber}</td>
              </tr>
              <tr>
                <td>温度</td>
                <td>
                  {screwStatus.temperature}
                  <span className='text-sm text-gray-400'>℃</span>
                </td>

                <td>时间</td>
                <td>{screwStatus.time.toLocaleString()}</td>

                <td>序列号</td>
                <td>{screwStatus.machineSerialNumber}</td>
              </tr>
              <tr>
                <td>启动信号</td>
                <td>{screwStatus.startFlag}</td>
                <td>启动方向</td>
                <td>{screwStatus.screwDirection === 1 ? '反转' : '正转'}</td>
              </tr>
            </tbody>
          </table>

          {!readonly && (
            <Space>
              <Button size='large' onClick={handleScrewing}>
                正转
              </Button>

              <Button size='large' onClick={handleReverseScrewing}>
                反转
              </Button>

              <Button size='large' onClick={handleSyncTime}>
                同步时间
              </Button>

              <Button
                size='large'
                onClick={() => {
                  if (screwStatus.lockFlag === 1) {
                    handleUnlock()
                  } else {
                    handleLock()
                  }
                }}
              >
                {screwStatus.lockFlag === 1 ? '解锁' : '锁定'}
              </Button>
            </Space>
          )}
        </Space>
      )}
    </Card>
  )
}

export default RealScrewStatus
