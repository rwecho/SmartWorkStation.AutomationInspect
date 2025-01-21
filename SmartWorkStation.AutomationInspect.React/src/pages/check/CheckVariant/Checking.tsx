import { Space, Button, Popconfirm, Tabs, message, Statistic } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { cancelChecking } from '../../../services/checking'
import { StationContext } from '../../../hooks/useStationContext'
import RealTorqueMeter from './RealTorqueMeter'
import RealScrewStatus from './RealScrewStatus'
import { CheckingStatus } from '../../../stores/checkingStore'
import Aging from './Aging'
import CheckPoint from './CheckPoint'
import useCheckStatus from '../../../hooks/useCheckStatus'
import ReactECharts from 'echarts-for-react'
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

  if (!station) {
    return <div>未选择工作站</div>
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
  const { status, realTorque, screwFactor, agingPoints, checkingPoints } =
    useCheckStatus(station.id)

  let count = 0
  useEffect(() => {
    const newOption = cloneDeep(option) // immutable
    const data0 = newOption.series[0].data
    const data1 = newOption.series[1].data
    if (!realTorque) return
    if (data0.length > 20) {
      data0.shift()
    }
    const { screwTorque, meterTorque } = realTorque

    data0.push(screwTorque as never)

    if (data1.length > 20) {
      data1.shift()
    }
    data1.push(meterTorque as never)

    newOption.xAxis[0].data.shift()
    newOption.xAxis[0].data.push(count++ as never)

    setOption(newOption)
  }, [realTorque])

  return (
    <Space direction='vertical' size='large' className='w-full '>
      <ReactECharts option={option} style={{ height: 400 }} />
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
