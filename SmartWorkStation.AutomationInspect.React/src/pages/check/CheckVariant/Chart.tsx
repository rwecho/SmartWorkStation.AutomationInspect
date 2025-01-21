import ReactECharts from 'echarts-for-react'
import cloneDeep from 'lodash.clonedeep'
import { useContext, useEffect, useState } from 'react'
import useCheckStatus from '../../../hooks/useCheckStatus'
import { StationContext } from '../../../hooks/useStationContext'

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

const ReactChart = () => {
  const { station } = useContext(StationContext)

  if (!station) {
    return <div>未选择工作站</div>
  }
  const [option, setOption] = useState(DEFAULT_OPTION)

  const { realTorque } = useCheckStatus(station.id)

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

  return <ReactECharts option={option} style={{ height: 400 }} />
}

export default ReactChart
