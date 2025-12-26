import { Breadcrumb, Button, Space, message } from "antd";
import { useMeterStore } from "../../../stores/meterStore";
import { useContext } from "react";
import { useScrewStore } from "../../../stores/screwStore";
import { StationContext } from "../../../hooks/useStationContext";
import RealScrewStatus from "./RealScrewStatus";
import RealTorqueMeter from "./RealTorqueMeter";
import { startChecking } from "../../../services/checking";

const Pending = () => {
  const { station } = useContext(StationContext);

  const value = useMeterStore((state) => state.value);
  const { screwStatus } = useScrewStore();

  if (station == null) {
    return <div>未选择工作站</div>;
  }
  const handleStart = async () => {
    try {
      await startChecking(station.id);
      message.success("开始校验成功");
    } catch {
      message.error("开始校验失败");
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      <Breadcrumb>
        <Breadcrumb.Item>{station.name}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex justify-center my-8">
        <Button
          size="large"
          onClick={handleStart}
          className="w-64 h-16"
          disabled={value === undefined || !screwStatus}
        >
          开始校验
        </Button>
      </div>
      <RealScrewStatus id={station.id} readonly={false}></RealScrewStatus>
      <RealTorqueMeter id={station.id} readonly={false}></RealTorqueMeter>
    </Space>
  );
};

export default Pending;
