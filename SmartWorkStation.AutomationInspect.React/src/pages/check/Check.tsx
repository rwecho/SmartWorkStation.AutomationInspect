import { Button, Card, Popconfirm, Space, Table, Tabs } from 'antd'
import { useStationCheckingStore } from '../../stores/checkingStore'
import { Station } from '../../stores/stationStore'
import { useEffect, useState } from 'react'
import cloneDeep from 'lodash.clonedeep'
import ReactECharts from 'echarts-for-react'

const Pending = () => {
  const { start } = useStationCheckingStore()
  const handleStart = () => {
    start(1)
  }

  return (
    <div className='flex w-full justify-center mt-32'>
      <Button size='large' onClick={handleStart}>
        开始校验
      </Button>
    </div>
  )
}

const CheckingTable = () => {
  const { merterTorques, screwTorques } = useStationCheckingStore()
  const data = merterTorques.map((item, index) => ({
    key: index,
    index: index + 1,
    merterTorque: item,
    screwTorque: screwTorques[index],
  }))

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '扭矩测量仪',
      dataIndex: 'merterTorque',
      key: 'merterTorque',
    },
    {
      title: '电批',
      dataIndex: 'screwTorque',
      key: 'screwTorque',
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        pageSize: 10,
      }}
    />
  )
}

const Checking = () => {
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
  const { merterTorques, screwTorques } = useStationCheckingStore()
  const [option, setOption] = useState(DEFAULT_OPTION)

  useEffect(() => {
    const newOption = cloneDeep(option) // immutable
    const last30MeterTorques = merterTorques.slice(-30)
    const last30ScrewTorques = screwTorques.slice(-30)

    newOption.series[0].data = last30MeterTorques as never[]
    newOption.series[1].data = last30ScrewTorques as never[]
    newOption.xAxis[0].data = last30MeterTorques.map(
      (_, index) => index + 1
    ) as never[]
    setOption(newOption)
  }, [merterTorques])

  const tabItems = [
    {
      key: '1',
      label: '拧紧曲线',
      children: (
        <Space direction='vertical' size='large' className='w-full'>
          <ReactECharts option={option} style={{ height: 400 }} />
          <Space>
            <Card>
              <Card.Meta title='实时系数'></Card.Meta>
              <table className='w-full table-fixed'>
                <tbody>
                  <tr>
                    <td>KP</td>
                    <td>0.01</td>
                    <td>b</td>
                    <td>0.02</td>
                    <td>电脑时间</td>
                    <td>0.02</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card className='h-full'>
              <Space>
                <Button color='blue' variant='solid' size='large'>
                  同步时间
                </Button>
                <Popconfirm
                  title='停止点检'
                  description='确定停止点检吗？'
                  okText='是'
                  cancelText='否'
                  onConfirm={() => {}}
                >
                  <Button type='primary' danger size='large'>
                    停止
                  </Button>
                </Popconfirm>
              </Space>
              {/* <Button type='primary' size='large'>
                已校准
              </Button> */}
            </Card>
          </Space>
          <Card>
            <Card.Meta title='电批实时参数'></Card.Meta>
            <table className='w-full table-fixed'>
              <tbody>
                <tr>
                  <td>扭矩测量仪</td>
                  <td>0.01</td>
                  <td>电批扭矩</td>
                  <td>0.02</td>
                  <td>速度</td>
                  <td>0.02</td>
                  <td>角度</td>
                  <td>20</td>
                  <td>温度</td>
                  <td>20</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Space>
      ),
    },
    {
      key: '2',
      label: '数据表',
      children: <CheckingTable />,
    },
  ]
  return <Tabs defaultActiveKey='1' items={tabItems}></Tabs>
}

const Done = () => {
  return <>2</>
}

const Error = () => {
  return <>3</>
}

const Check = ({}: { station?: Station }) => {
  const { status } = useStationCheckingStore()

  return (
    <div>
      {status == 'pending' && <Pending></Pending>}
      {status == 'checking' && <Checking></Checking>}
      {status == 'done' && <Done></Done>}
      {status == 'error' && <Error></Error>}
    </div>
  )
}

export default Check
