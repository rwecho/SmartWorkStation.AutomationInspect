import { Card, Space, Tag, Tooltip } from "antd";
import {
  DesktopOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { memo } from "react";
import { Station } from "../../stores/stationStore";

interface Props {
  station: Station;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

const StationCard = memo(({ station, selected, onClick, small }: Props) => {
  const description = (
    <Space wrap size={[0, 4]} className="mt-2 w-full">
      <Tag
        icon={<EnvironmentOutlined />}
        color="default"
        className="m-0 max-w-full flex items-center"
      >
        <span className="truncate">
          {station.ip}:{station.port}
        </span>
      </Tag>
      <Tag icon={<ThunderboltOutlined />} color="blue" className="m-0">
        {station.targetTorque} N.m
      </Tag>
      {station.checking && (
        <Tag icon={<CheckCircleOutlined />} color="success" className="m-0">
          自动校验
        </Tag>
      )}
      {station.byDuration && (
        <Tag icon={<ClockCircleOutlined />} color="orange" className="m-0">
          {station.duration} min
        </Tag>
      )}
    </Space>
  );

  return (
    <Card
      hoverable
      onClick={onClick}
      className={`w-full cursor-pointer transition-all duration-200 transform select-none ${
        selected
          ? "border-blue-500 ring-2 ring-blue-100 shadow-md bg-blue-50/50"
          : "border-gray-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5"
      } active:scale-[0.98] active:duration-75`}
      size={small ? "small" : "default"}
      styles={{
        body: small ? { padding: "8px 12px" } : { padding: "16px" },
      }}
    >
      {small ? (
        <div className="flex items-center gap-2">
          <DesktopOutlined
            className={selected ? "text-blue-500" : "text-gray-400"}
          />
          <div className="truncate font-medium flex-1">
            <Tooltip title={station.name} mouseEnterDelay={0.5}>
              {station.name}
            </Tooltip>
          </div>
        </div>
      ) : (
        <Card.Meta
          title={<span className="text-lg font-semibold">{station.name}</span>}
          description={description}
        />
      )}
    </Card>
  );
});

StationCard.displayName = "StationCard";

export default StationCard;
