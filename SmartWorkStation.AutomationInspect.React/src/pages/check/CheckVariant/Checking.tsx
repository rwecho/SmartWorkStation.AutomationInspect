import { Table, Space, Card, Button, Popconfirm, Tabs, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { cancelChecking } from '../../../services/checking'
import { StationContext } from '../../../hooks/useStationContext'
import RealTorqueMeter from './RealTorqueMeter'
import RealScrewStatus from './RealScrewStatus'
import {
  CheckingStatus,
  PointItem,
  useCheckingStore,
} from '../../../stores/checkingStore'
import Aging from './Aging'
import CheckPoint from './CheckPoint'
import { fullifyUrl } from '../../../services/fetch'
import cloneDeep from 'lodash.clonedeep'

const CheckingChart = () => {
  const DEFAULT_OPTION = {
    title: {
      text: '拧紧数据曲线',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['扭矩测量仪', '电批'],
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      top: 60,
      left: 30,
      right: 60,
      bottom: 30,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '扭矩',
      },
    ],
    series: [
      {
        name: '扭矩测量仪',
        type: 'line',
        data: [],
      },
      {
        name: '电批',
        type: 'bar',
        data: [],
        itemStyle: {
          normal: {
            barBorderRadius: 4,
          },
        },
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return idx * 10
        },
        animationDelayUpdate: function (idx: number) {
          return idx * 10
        },
      },
    ],
  }
  const [option, setOption] = useState(DEFAULT_OPTION)

  const { station } = useContext(StationContext)

  const { pointItems, agingItems } = useCheckingStore()

  const last30Items = useMemo(() => {
    return [...pointItems, ...agingItems].slice(-30)
  }, [pointItems, agingItems])

  useEffect(() => {
    const newOption = cloneDeep(option) // immutable
    const items = last30Items
    debugger

    const last30MeterTorques = last30Items.map((o) => o.MeterTorque)
    const last30ScrewTorques = last30Items.map((o) => o.ScrewTorque)
    // newOption.series[0].data = last30MeterTorques as never[]
    // newOption.series[1].data = last30ScrewTorques as never[]
    // newOption.xAxis[0].data = last30MeterTorques.map(
    //   (_, index) => index + 1
    // ) as never[]
    // setOption(newOption)
  }, [last30Items])

  if (!station) {
    return <>请选择工作站</>
  }

  const handleCancel = async () => {
    try {
      debugger
      await cancelChecking(station.id)
      message.info('停止成功')
    } catch {
      message.error('停止失败')
    }
  }

  return (
    <Space direction='vertical' size='large' className='w-full'>
      <ReactECharts option={option} style={{ height: 400 }} />
      <Space>
        <Card className='h-full'>
          <Space>
            <Popconfirm
              title='停止点检'
              description='确定停止点检吗？'
              okText='是'
              cancelText='否'
              onConfirm={handleCancel}
            >
              <Button type='primary' danger size='large'>
                停止
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      </Space>

      <RealScrewStatus id={station.id} readonly></RealScrewStatus>
      <RealTorqueMeter id={station.id} readonly></RealTorqueMeter>
    </Space>
  )
}

const Checking = ({ status }: { status: CheckingStatus }) => {
  const { station } = useContext(StationContext)
  const { addPointItem, addAgingItem } = useCheckingStore()
  useEffect(() => {
    const url = `/api/checking/${station?.id}/check-point/data`
    const eventSource = new EventSource(fullifyUrl(url))
    eventSource.onmessage = (event) => {
      if (event.data) {
        const item = JSON.parse(event.data) as PointItem
        addPointItem(item)
      }
    }
  }, [addPointItem])

  useEffect(() => {
    const url = `/api/checking/${station?.id}/aging/data`
    const eventSource = new EventSource(fullifyUrl(url))
    eventSource.onmessage = (event) => {
      if (event.data) {
        const item = JSON.parse(event.data) as PointItem
        addAgingItem(item)
      }
    }
  }, [addAgingItem])

  const tabItems = [
    {
      key: '1',
      label: '拧紧曲线',
      children: <CheckingChart></CheckingChart>,
    },
    {
      key: '2',
      label: '数据表',
      children: (
        <Space direction='vertical' size={'large'} className='w-full'>
          <CheckPoint></CheckPoint>
          <Aging></Aging>
        </Space>
      ),
    },
  ]
  return <Tabs defaultActiveKey='1' items={tabItems}></Tabs>
}

export default Checking
