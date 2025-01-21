import { Station } from '../../stores/stationStore'
import { StationProvider } from '../../hooks/useStationContext'
import Finished from './CheckVariant/Finished'
import Error from './CheckVariant/Error'
import Pending from './CheckVariant/Pending'
import Checking from './CheckVariant/Checking'
import useCheckStatus from '../../hooks/useCheckStatus'
import { CheckingStatus } from '../../stores/checkingStore'
import { Badge } from 'antd'
import Canceled from './CheckVariant/Canceled'

const CheckBadge = ({
  status,
  children,
}: {
  status: CheckingStatus
  children: React.ReactNode
}) => {
  const getBadgeProps = () => {
    if (status === CheckingStatus.idle) {
      return {
        text: '待校验',
        color: 'gray',
      }
    }
    if (status === CheckingStatus.checking) {
      return {
        text: '校验中',
        color: 'blue',
      }
    }
    if (status === CheckingStatus.calibrated) {
      return {
        text: '校验完成',
        color: 'green',
      }
    }
    if (status === CheckingStatus.aging) {
      return {
        text: '老化中',
        color: 'orange',
      }
    }
    if (status === CheckingStatus.canceled) {
      return {
        text: '校验取消',
        color: 'orange',
      }
    }
    if (status === CheckingStatus.finished) {
      return {
        text: '校验完成',
        color: 'green',
      }
    }
    if (status === CheckingStatus.error) {
      return {
        text: '校验错误',
        color: 'red',
      }
    }

    return {
      text: '未知状态',
      color: 'gray',
    }
  }

  const { text, color } = getBadgeProps()
  return (
    <Badge.Ribbon text={text} color={color}>
      {children}
    </Badge.Ribbon>
  )
}

const Check = ({ station }: { station?: Station }) => {
  if (!station) {
    return <div>未选择工作站</div>
  }
  const { status } = useCheckStatus(station.id)

  return (
    <StationProvider station={station}>
      <CheckBadge status={status}>
        <div>
          {status === CheckingStatus.idle && <Pending></Pending>}
          {(status == CheckingStatus.checking ||
            status == CheckingStatus.calibrated ||
            status == CheckingStatus.aging) && (
            <Checking status={status}></Checking>
          )}
          {status == CheckingStatus.canceled && <Canceled></Canceled>}
          {status == CheckingStatus.finished && <Finished></Finished>}
          {status == CheckingStatus.error && <Error></Error>}
        </div>
      </CheckBadge>
    </StationProvider>
  )
}

export default Check
