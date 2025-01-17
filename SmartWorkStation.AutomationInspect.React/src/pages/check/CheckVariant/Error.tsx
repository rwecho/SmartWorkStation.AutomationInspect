import { Button } from 'antd'
import { finishChecking } from '../../../services/checking'

const Error = () => {
  const handleReset = () => {
    finishChecking(1)
  }
  return (
    <>
      error
      <Button onClick={handleReset} type='primary'>
        复位
      </Button>
    </>
  )
}

export default Error
