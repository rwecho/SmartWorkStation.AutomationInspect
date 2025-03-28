import { Button, Card, Space, Tag, Tooltip, message } from "antd";
import { useEffect } from "react";
import "./RealScrewStatus.css";
import { useScrewStore } from "../../../stores/screwStore";
import {
  getScrewStatus,
  lock,
  reverseScrewing,
  screwing,
  syncTime,
  unlock,
} from "../../../services/screw";

enum ScrewStatusEnum {
  Ready = 0,
  Run = 1,
  OK = 2,
  NG = 3,
  Warning = 4,
}

const parseStatus = (status: number) => {
  switch (status) {
    case ScrewStatusEnum.Ready:
      return <Tag color="blue">准备</Tag>;
    case ScrewStatusEnum.Run:
      return <Tag color="processing">运行</Tag>;
    case ScrewStatusEnum.OK:
      return <Tag color="success">OK</Tag>;
    case ScrewStatusEnum.NG:
      return <Tag color="error">NG</Tag>;
    case ScrewStatusEnum.Warning:
      return <Tag color="warning">警告</Tag>;
    default:
      return <Tag>未知</Tag>;
  }
};

const getProcedureStatus = (num: number) => {
  const ones = num % 10;
  const tens = Math.floor(num / 10) % 10;
  const hundreds = Math.floor(num / 100);

  let statusText = "";
  let color: string = "";

  // 解析个位和十位的状态
  switch (tens * 10 + ones) {
    case 1:
      statusText = "动作未完成，启动信号已消失";
      color = "error";
      break;
    case 2:
      statusText = "到达上限角度";
      color = "error";
      break;
    case 3:
      statusText = "到达上限时间";
      color = "error";
      break;
    case 4:
      statusText = "到达上限扭矩";
      color = "error";
      break;
    case 5:
      statusText = "小于下限角度";
      color = "error";
      break;
    case 6:
      statusText = "小于下限时间";
      color = "error";
      break;
    case 7:
      statusText = "小于下限扭矩";
      color = "error";
      break;
    case 9:
      statusText = "动作完成";
      color = "success";
      break;
    case 11:
      statusText = "扭矩设定值超过最大允许值";
      color = "error";
      break;
    case 12:
      statusText = "目标扭矩或扭矩上限设置为0";
      color = "error";
      break;
    case 13:
      statusText = "拧松最大扭矩设置太小或螺丝拧得太紧";
      color = "error";
      break;
    case 14:
      statusText = "运行圈数小于浮高圈数";
      color = "error";
      break;
    case 15:
      statusText = "运行圈数大于滑牙圈数";
      color = "error";
      break;
  }

  // 解析百位的过程
  let processText = "";
  switch (hundreds) {
    case 1:
      processText = "拧紧过程1";
      break;
    case 2:
      processText = "拧紧过程2";
      break;
    case 3:
      processText = "拧紧过程3";
      break;
    case 4:
      processText = "拧紧过程4";
      break;
    case 5:
      processText = "拧松过程";
      break;
    case 6:
      processText = "自由转过程";
      break;
  }

  return { statusText, processText, color };
};

const RealScrewStatus = ({
  id,
  readonly = false,
}: {
  id: number;
  readonly: boolean;
}) => {
  const { screwStatus, setScrewStatus } = useScrewStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const screwStatus = await getScrewStatus(id);
        setScrewStatus(screwStatus);
      } catch (error) {
        message.error("无法连接到螺丝机");
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [id, setScrewStatus]);

  if (!screwStatus) {
    return <></>;
  }

  const handleScrewing = async () => {
    try {
      await screwing(id);
      message.success("正转成功");
    } catch (error) {
      message.error("正转失败");
    }
  };

  const handleReverseScrewing = async () => {
    try {
      await reverseScrewing(id);
      message.success("反转成功");
    } catch (error) {
      message.error("反转失败");
    }
  };

  const handleSyncTime = async () => {
    try {
      await syncTime(id);
      message.success("同步时间成功");
    } catch (error) {
      message.error("同步时间失败");
    }
  };

  const handleLock = async () => {
    try {
      await lock(id);
      message.success("锁定成功");
    } catch (error) {
      message.error("锁定失败");
    }
  };

  const handleUnlock = async () => {
    try {
      await unlock(id);
      message.success("解锁成功");
    } catch (error) {
      message.error("解锁失败");
    }
  };

  return (
    <Card>
      {screwStatus && (
        <Space direction="vertical" size="large">
          <table>
            <tbody>
              <tr>
                <td>程序号</td>
                <td>{screwStatus.pset}</td>

                <td>扭矩</td>
                <td>
                  {screwStatus.torque / 100.0}
                  <span className="text-sm text-gray-400"> N.m</span>
                </td>

                <td>转速</td>
                <td>
                  {screwStatus.rpm}{" "}
                  <span className="text-sm text-gray-400">rpm</span>
                </td>

                <td>锁定标志</td>
                <td>
                  <Tag color="orange">
                    {screwStatus.lockFlag === 1 ? "锁定" : "未锁定"}
                  </Tag>
                </td>
              </tr>

              <tr>
                <td>角度</td>
                <td>
                  {screwStatus.angle}
                  <span className="text-sm text-gray-400">°</span>
                </td>

                <td>状态</td>
                <td>{parseStatus(screwStatus.status)}</td>

                <td>过程号</td>
                <td>
                  {screwStatus.procedureNumber}
                  {screwStatus.procedureNumber > 0 && (
                    <Tooltip
                      title={
                        getProcedureStatus(screwStatus.procedureNumber)
                          .statusText
                      }
                    >
                      <Tag
                        className="ml-2"
                        color={
                          getProcedureStatus(screwStatus.procedureNumber).color
                        }
                      >
                        {
                          getProcedureStatus(screwStatus.procedureNumber)
                            .processText
                        }
                      </Tag>
                    </Tooltip>
                  )}
                </td>
              </tr>
              <tr>
                <td>温度</td>
                <td>
                  {screwStatus.temperature}
                  <span className="text-sm text-gray-400">℃</span>
                </td>

                <td>时间</td>
                <td>{screwStatus.time.toLocaleString()}</td>

                <td>序列号</td>
                <td>{screwStatus.machineSerialNumber}</td>
              </tr>
              <tr>
                <td>启动</td>
                <td>
                  {screwStatus.startFlag === 1 ? (
                    <Tag color="green">启动</Tag>
                  ) : (
                    <Tag color="red">停止</Tag>
                  )}
                  {screwStatus.screwDirection === 1 ? (
                    <Tag color="red">反转</Tag>
                  ) : (
                    <Tag color="green">正转</Tag>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {!readonly && (
            <Space>
              <Button size="large" onClick={handleScrewing}>
                正转
              </Button>

              <Button size="large" onClick={handleReverseScrewing}>
                反转
              </Button>

              <Button size="large" onClick={handleSyncTime}>
                同步时间
              </Button>

              <Button
                size="large"
                onClick={() => {
                  if (screwStatus.lockFlag === 1) {
                    handleUnlock();
                  } else {
                    handleLock();
                  }
                }}
              >
                {screwStatus.lockFlag === 1 ? "解锁" : "锁定"}
              </Button>
            </Space>
          )}
        </Space>
      )}
    </Card>
  );
};

export default RealScrewStatus;
