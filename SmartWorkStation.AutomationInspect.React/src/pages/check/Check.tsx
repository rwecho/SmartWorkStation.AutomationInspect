import { CheckingStatus, useCheckingStore } from '../../stores/checkingStore'
import { Station } from '../../stores/stationStore'
import { StationProvider } from '../../hooks/useStationContext'
import Calibrated from './CheckVariant/CheckPoint'
import Aging from './CheckVariant/Aging'
import Finished from './CheckVariant/Finished'
import Error from './CheckVariant/Error'
import Pending from './CheckVariant/Pending'
import Checking from './CheckVariant/Checking'
import { useEffect } from 'react'
import { fullifyUrl } from '../../services/fetch'

const Check = ({ station }: { station?: Station }) => {
  const { status, setStatus } = useCheckingStore()

  if (!station) {
    return <div>未选择工作站</div>
  }
  useEffect(() => {
    const eventSource = new EventSource(
      fullifyUrl(`/api/checking/${station.id}/status`)
    )
    eventSource.onmessage = (event) => {
      setStatus(JSON.parse(event.data))
    }
    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <StationProvider station={station}>
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
    </StationProvider>
  )
}

export default Check
