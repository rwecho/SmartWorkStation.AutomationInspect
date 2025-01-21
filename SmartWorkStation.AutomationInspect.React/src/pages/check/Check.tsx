import { Station } from '../../stores/stationStore'
import { StationProvider } from '../../hooks/useStationContext'
import Finished from './CheckVariant/Finished'
import Error from './CheckVariant/Error'
import Pending from './CheckVariant/Pending'
import Checking from './CheckVariant/Checking'
import useCheckStatus from '../../hooks/useCheckStatus'
import { CheckingStatus } from '../../stores/checkingStore'
import { Affix, Badge, Button, Card } from 'antd'

const Check = ({ station }: { station?: Station }) => {
  if (!station) {
    return <div>未选择工作站</div>
  }
  const { status } = useCheckStatus(station.id)

  const hippies = (status: CheckingStatus) => {
    if (status === CheckingStatus.idle) {
      return '待校验'
    }
    if (status === CheckingStatus.checking) {
      return '校验中'
    }
    if (status === CheckingStatus.calibrated) {
      return '校验完成'
    }
    if (status === CheckingStatus.aging) {
      return '老化中'
    }
    if (status === CheckingStatus.finished) {
      return '校验完成'
    }
    if (status === CheckingStatus.error) {
      return '校验错误'
    }
  }

  return (
    <StationProvider station={station}>
      <Badge.Ribbon text={hippies(status)}>
        <div>
          {status === CheckingStatus.idle && <Pending></Pending>}
          {(status == CheckingStatus.checking ||
            status == CheckingStatus.calibrated ||
            status == CheckingStatus.aging) && (
            <Checking status={status}></Checking>
          )}
          {status == CheckingStatus.finished && <Finished></Finished>}
          {status == CheckingStatus.error && <Error></Error>}
        </div>
      </Badge.Ribbon>
    </StationProvider>
  )
}

export default Check
