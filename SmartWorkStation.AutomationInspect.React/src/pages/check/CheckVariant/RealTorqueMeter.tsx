import { Button, Card, Space, message } from 'antd'
import { useEffect } from 'react'
import { useMeterStore } from '../../../stores/meterStore'
import { reset, togglePeek, toggleUnit } from '../../../services/meter'
import { fullifyUrl } from '../../../services/fetch'

const parseUnit = (unit: number) => {
  switch (unit) {
    case 0:
      return 'Kgf.cm'
    case 1:
      return 'Lbf.in'
    case 2:
      return 'N.m'
    default:
      return '未知'
  }
}

const parsePeek = (peek: number) => {
  switch (peek) {
    case 0:
      return '实时'
    case 1:
      return '峰值'
    default:
      return '未知'
  }
}

const RealTorqueMeter = ({
  id,
  readonly = false,
}: {
  id: number
  readonly: boolean
}) => {
  const { info, value, setValue, setInfo } = useMeterStore()

  useEffect(() => {
    setValue(undefined)

    const eventSource = new EventSource(
      fullifyUrl(`/api/checking/${id}/meter/value`)
    )
    eventSource.onmessage = (event) => {
      setValue(parseFloat(event.data))
    }
    eventSource.onerror = () => {
      console.log('无法连接到扭力测量仪')
    }

    return () => {
      eventSource.close()
    }
  }, [id, setValue])

  useEffect(() => {
    setInfo(undefined)
    const eventSource = new EventSource(
      fullifyUrl(`api/checking/${id}/meter/info`)
    )
    eventSource.onmessage = (event) => {
      setInfo(JSON.parse(event.data))
    }
    eventSource.onerror = () => {
      message.error('无法连接到扭力测量仪')
    }
    return () => {
      eventSource.close()
    }
  }, [id, setInfo])

  const handlePeek = async () => {
    try {
      await togglePeek(id)
      message.success('切换成功')
    } catch (error) {
      message.error('切换失败')
    }
  }

  const handleUnit = async () => {
    try {
      await toggleUnit(id)
      message.success('切换成功')
    } catch (error) {
      message.error('切换失败')
    }
  }

  const handleReset = async () => {
    try {
      await reset(id)
      message.success('复位成功')
    } catch (error) {
      message.error('复位失败')
    }
  }

  return (
    <Card>
      {info && (
        <Space direction='vertical'>
          <table>
            <tbody>
              <tr>
                <td>型号</td>
                <td>{info.Model}</td>

                <td>单位</td>
                <td>{parseUnit(info.Unitorder)}</td>

                <td>模式</td>
                <td>{parsePeek(info.Peek)}</td>

                <td>力矩</td>
                <td>{value}</td>
              </tr>
            </tbody>
          </table>
          {!readonly && (
            <Space>
              <Button size='large' onClick={handlePeek}>
                峰值
              </Button>
              <Button size='large' onClick={handleUnit}>
                单位
              </Button>
              <Button size='large' onClick={handleReset}>
                复位
              </Button>
            </Space>
          )}
        </Space>
      )}
    </Card>
  )
}

export default RealTorqueMeter
