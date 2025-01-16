import {
  GetProp,
  ConfigProvider,
  Empty,
  Table,
  Button,
  Card,
  Space,
  Popconfirm,
  Badge,
} from 'antd'
import { Station, useStationStore } from '../../stores/stationStore'
import { useEffect } from 'react'
import { App } from 'antd'
import ButtonGroup from 'antd/es/button/button-group'
import CreateOrUpdateModal from './CreateOrUpdateModal'
import { useModal } from '../../hooks/useModal'

const HomePage = () => {
  const { stations, load, add, remove, update } = useStationStore()
  const { message } = App.useApp()

  console.log('stations:', stations)
  useEffect(() => {
    load()
      .then(() => {})
      .catch(() => {
        message.error('数据加载失败')
      })
  }, [load])

  const columns: GetProp<typeof Table<Station>, 'columns'> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '是否需要校验',
      dataIndex: 'adjust',
      key: 'adjust',
      render: (adjust) => {
        return adjust ? <Badge status='success'>是</Badge> : <Badge>否</Badge>
      },
    },
    {
      title: '持续时间/次数',
      key: 'durationOrTimes',
      render: (record) => {
        return record.byDuration ? (
          <span>{record.duration} 小时</span>
        ) : (
          <span>{record.times} 次</span>
        )
      },
    },
    {
      title: '目标扭矩',
      dataIndex: 'targetTorque',
      key: 'targetTorque',
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        <Space size={'small'}>
          <ButtonGroup>
            <Button
              size='small'
              type='primary'
              onClick={() => {
                handleEdit(record)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title='工作台'
              description='确定删除该工作台吗？'
              okText='是'
              cancelText='否'
              onConfirm={() => {
                handleDelete(record.id)
              }}
            >
              <Button size='small' type='primary' danger>
                删除
              </Button>
            </Popconfirm>
          </ButtonGroup>
        </Space>
      ),
    },
  ]

  const [show] = useModal()
  const handleEdit = async (station: Station) => {
    try {
      const result = await show({
        title: '编辑工作台',
        children: <CreateOrUpdateModal station={station}></CreateOrUpdateModal>,
        footer: null,
      })

      console.log('result:', result)

      if (!result) {
        return
      }

      update(result as Station)
      message.success('编辑成功')
    } catch (e) {
      message.error('编辑失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      message.success('删除成功')
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleAdd = async () => {
    const result = await show({
      title: '添加工作台',
      children: <CreateOrUpdateModal></CreateOrUpdateModal>,
      footer: null,
    })
    if (!result) {
      return
    }
    try {
      await add(result as Station)
      message.success('添加成功')
    } catch (e: any) {
      message.error(`添加失败: ${e.message}`)
    }
  }

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Card: {
              bodyPadding: 0,
            },
          },
        }}
      >
        <Card
          title='工作台管理'
          bordered={false}
          extra={
            <div>
              <Button type='primary' onClick={handleAdd}>
                添加
              </Button>
            </div>
          }
        >
          <Table<Station>
            dataSource={stations}
            columns={columns}
            locale={{
              emptyText: <Empty description='暂无数据'></Empty>,
            }}
          />
        </Card>
      </ConfigProvider>
    </>
  )
}

export default HomePage
