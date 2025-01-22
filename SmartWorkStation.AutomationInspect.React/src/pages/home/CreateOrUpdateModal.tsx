import {
  Form,
  Space,
  Input,
  InputNumber,
  Radio,
  Switch,
  Divider,
  Button,
  Select,
} from 'antd'
import { Station, useStationStore } from '../../stores/stationStore'
import { useContext, useState } from 'react'
import { ModalContext } from '../../hooks/useModal'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

type CreateOrUpdateModalProps = {
  station?: Station
  // onFinished?: (values: Station) => void
}
const CreateOrUpdateModal = (props: CreateOrUpdateModalProps) => {
  const { stations } = useStationStore()

  // get the max id of the stations and add 1
  const initialStationId =
    stations.reduce((max, station) => {
      return station.id > max ? station.id : max
    }, 0) + 1

  const modalContext = useContext(ModalContext)

  const initialValues = props.station || {
    id: initialStationId,
    name: '工作站' + initialStationId,
    ip: '192.168.1.123',
    port: 502,
    com: 'COM3',
    baudRate: 19200,
    dataBits: 8,
    parity: 0,
    stopBits: 1,
    checking: true,
    checkingTimes: 10,
    byDuration: true,
    duration: 60,
    times: 100,
    targetTorque: 1.8,
    screwingWaitTime: 3.5,
    reverseScrewingWaitTime: 2.5,
  }
  const [byDuration, setByDuration] = useState(initialValues.byDuration)
  const [form] = Form.useForm()
  return (
    <Form
      form={form}
      initialValues={initialValues}
      onFinish={(values) => {
        if (modalContext.onOk) modalContext.onOk(values)
      }}
    >
      <Space className='w-full justify-between'>
        <Form.Item<Station>
          label='编号'
          name='id'
          rules={[{ required: true, message: '请输入正确的编号' }]}
        >
          <Input
            style={{
              width: '120px',
            }}
            disabled={!!props.station}
          />
        </Form.Item>
        <Form.Item<Station>
          label='名称'
          name='name'
          rules={[{ required: true, message: '请输入合适的名称' }]}
        >
          <Input style={{ width: '200px' }} />
        </Form.Item>
      </Space>
      <Space className='w-full justify-between'>
        <Form.Item<Station>
          label='IP 地址'
          name='ip'
          rules={[{ required: true, message: '请输入正确的IP地址' }]}
        >
          <Input
            style={{
              width: '120px',
            }}
          />
        </Form.Item>
        <Form.Item<Station>
          label='端口'
          name='port'
          rules={[{ required: true, message: '请输入端口' }]}
        >
          <InputNumber min={100} max={65535} />
        </Form.Item>
      </Space>
      <Space className='w-full' wrap>
        <Form.Item<Station>
          label='COM'
          name='com'
          rules={[{ required: true, message: '请输入正确的COM' }]}
        >
          <Input
            style={{
              width: '120px',
            }}
          />
        </Form.Item>
        <Form.Item<Station>
          label='波特率'
          name='baudRate'
          rules={[{ required: true, message: '请选择波特率' }]}
        >
          <Select defaultValue={19200}>
            <Select.Option value={9600}>9600</Select.Option>
            <Select.Option value={14400}>14400</Select.Option>
            <Select.Option value={19200}>19200</Select.Option>
            <Select.Option value={38400}>38400</Select.Option>
            <Select.Option value={57600}>57600</Select.Option>
            <Select.Option value={115200}>115200</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item<Station>
          label='校验位'
          name='parity'
          rules={[{ required: true, message: '请选择校验位' }]}
        >
          <Select defaultValue={1}>
            <Select.Option value={0}>None</Select.Option>
            <Select.Option value={1}>Odd</Select.Option>
            <Select.Option value={2}>Even</Select.Option>
            <Select.Option value={3}>Mark</Select.Option>
            <Select.Option value={4}>Space</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item<Station>
          label='停止位'
          name='stopBits'
          rules={[{ required: true, message: '请选择停止位' }]}
        >
          <Select defaultValue={0}>
            <Select.Option value={0}>None</Select.Option>
            <Select.Option value={1}>One</Select.Option>
            <Select.Option value={2}>Two</Select.Option>
            <Select.Option value={3}>OnePointFive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item<Station>
          label='数据位'
          name='dataBits'
          hidden
          rules={[{ required: true, message: '请填写数据位' }]}
        >
          <InputNumber min={5} max={8} />
        </Form.Item>
      </Space>

      <Space>
        <Form.Item<Station>
          label='正转等待时间'
          name='screwingWaitTime'
          rules={[{ required: true, message: '请输入合适的等待时间' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item<Station>
          label='反拧等待时间'
          name='reverseScrewingWaitTime'
          rules={[{ required: true, message: '请输入合适的等待时间' }]}
        >
          <InputNumber />
        </Form.Item>
      </Space>

      <Divider>校验</Divider>
      <Form.List
        name='checkingPoints'
        rules={[
          {
            validator: async () => {
              return Promise.resolve()
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            <Space wrap>
              {fields.map((field) => (
                <Form.Item required={false} key={field.key}>
                  <Space>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: '请输入校验扭矩',
                        },
                      ]}
                      noStyle
                    >
                      <InputNumber
                        placeholder='扭矩'
                        style={{ width: '90%' }}
                      />
                    </Form.Item>
                  </Space>
                  <span className='text-xs text-gray-400 mr-1'>N.m</span>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className='dynamic-delete-button'
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Form.Item>
              ))}
            </Space>
            <Form.Item>
              <Button
                type='dashed'
                onClick={() => add()}
                style={{ width: '100%' }}
                icon={<PlusOutlined />}
              >
                增加校验点
              </Button>

              {/* <Form.ErrorList errors={errors} /> */}
            </Form.Item>
          </>
        )}
      </Form.List>

      <Space className='w-full justify-between'>
        <Form.Item<Station> label='校验次数' name='checkingTimes'>
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item<Station>
          label='是否需要校验'
          name='checking'
          valuePropName='checked'
        >
          <Switch></Switch>
        </Form.Item>
      </Space>

      <Divider>老化</Divider>

      <Space className='w-full justify-between'>
        <Form.Item label='按照时间/次数' name={'byDuration'}>
          <Radio.Group
            defaultValue='true'
            onChange={(e) => {
              setByDuration(e.target.value)
            }}
          >
            <Radio.Button value={true}>时间</Radio.Button>
            <Radio.Button value={false}>次数</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {byDuration && (
          <Form.Item<Station> label='持续时间(分钟)' name='duration'>
            <InputNumber defaultValue={30} />
          </Form.Item>
        )}

        {!byDuration && (
          <Form.Item<Station> label='持续次数(次数)' name='times'>
            <InputNumber defaultValue={10} />
          </Form.Item>
        )}
      </Space>
      <Space>
        <Form.Item<Station>
          label='目标扭矩(N.m)'
          name='targetTorque'
          rules={[{ required: true, message: '请输入合适的扭矩' }]}
        >
          <InputNumber />
        </Form.Item>
      </Space>

      <Divider></Divider>
      <Space className='w-full justify-end'>
        <Button type='primary' htmlType='submit' className='ml-auto'>
          保存
        </Button>
        <Button
          onClick={() => {
            if (modalContext.onCancel) modalContext.onCancel()
          }}
        >
          取消
        </Button>
      </Space>
    </Form>
  )
}

export default CreateOrUpdateModal
