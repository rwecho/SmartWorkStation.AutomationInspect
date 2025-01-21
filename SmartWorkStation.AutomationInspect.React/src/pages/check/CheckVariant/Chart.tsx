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

  useEffect(() => {
    const newOption = cloneDeep(option) // immutable
    const data0 = newOption.series[0].data
    const data1 = newOption.series[1].data
    const axisData = newOption.xAxis[0].data
    if (!realTorque) return
    const { screwTorque, meterTorque } = realTorque
    if (data0.length > 20) {
      data0.shift()
      data1.shift()
      axisData.shift()
    }
    const x = data0.length + 1
    data0.push(meterTorque as never)
    data1.push((screwTorque / 100.0) as never)
    axisData.push(x as never)

    setOption(newOption)
  }, [realTorque])

  return <ReactECharts option={option} style={{ height: 400 }} />
}

export default ReactChart
