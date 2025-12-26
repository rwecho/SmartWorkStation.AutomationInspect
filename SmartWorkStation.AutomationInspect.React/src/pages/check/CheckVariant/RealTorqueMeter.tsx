import { Button, Card, Space, message } from "antd";
import { useEffect } from "react";
import { useMeterStore } from "../../../stores/meterStore";
import {
  getInfo,
  getValue,
  reset,
  togglePeek,
  toggleUnit,
} from "../../../services/meter";
import { useShallow } from "zustand/shallow";

const parseUnit = (unit: number) => {
  switch (unit) {
    case 0:
      return "Kgf.cm";
    case 1:
      return "Lbf.in";
    case 2:
      return "N.m";
    default:
      return "未知";
  }
};

const parsePeek = (peek: number) => {
  switch (peek) {
    case 0:
      return "实时";
    case 1:
      return "峰值";
    default:
      return "未知";
  }
};

const RealTorqueMeter = ({
  id,
  readonly = false,
}: {
  id: number;
  readonly: boolean;
}) => {
  const { info, value, setValue, setInfo } = useMeterStore(
    useShallow((state) => {
      return {
        info: state.info,
        value: state.value,
        setValue: state.setValue,
        setInfo: state.setInfo,
      };
    })
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const value = await getValue(id);
        setValue(value);
      } catch {
        // 静默失败，避免轮询时弹出大量错误消息
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [id, setValue]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const info = await getInfo(id);
        setInfo(info);
      } catch {
        // 静默失败
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [id, setInfo]);

  const handlePeek = async () => {
    try {
      await togglePeek(id);
      message.success("切换成功");
    } catch {
      message.error("切换失败");
    }
  };

  const handleUnit = async () => {
    try {
      await toggleUnit(id);
      message.success("切换成功");
    } catch {
      message.error("切换失败");
    }
  };

  const handleReset = async () => {
    try {
      await reset(id);
      message.success("复位成功");
    } catch {
      message.error("复位失败");
    }
  };

  return (
    <Card>
      {info && (
        <Space direction="vertical">
          <table>
            <tbody>
              <tr>
                <td>型号</td>
                <td>{info.model}</td>

                <td>单位</td>
                <td>{parseUnit(info.unitorder)}</td>

                <td>模式</td>
                <td>{parsePeek(info.peek)}</td>

                <td>力矩</td>
                <td>{value}</td>
              </tr>
            </tbody>
          </table>
          {!readonly && (
            <Space>
              <Button size="large" onClick={handlePeek}>
                峰值
              </Button>
              <Button size="large" onClick={handleUnit}>
                单位
              </Button>
              <Button size="large" onClick={handleReset}>
                复位
              </Button>
            </Space>
          )}
        </Space>
      )}
    </Card>
  );
};

export default RealTorqueMeter;
