import { Avatar, Card, Space, Tag, Tooltip } from "antd";
import { Station } from "../../stores/stationStore";

interface Props {
  station: Station;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

const StationCard = ({ station, selected, onClick, small }: Props) => {
  const description = (
    <Space wrap>
      <Tag color="cyan">
        {station.ip}:{station.port}
      </Tag>
      <Tag color="cyan">扭矩: {station.targetTorque} N.m</Tag>
      {station.checking && <Tag color="success">自动校验</Tag>}
      {station.byDuration && <Tag color="orange">{station.duration} 分钟</Tag>}
    </Space>
  );
  return (
    <Card
      hoverable
      onClick={onClick}
      className={`w-full cursor-pointer transition-colors items-center justify-center ${
        selected ? "border-blue-400" : ""
      }`}
      size={small ? "small" : "default"}
    >
      {small && (
        <div className=" whitespace-nowrap text-ellipsis overflow-hidden">
          <Tooltip title={station.name}>{station.name}</Tooltip>
        </div>
      )}

      {!small && <Card.Meta title={station.name} description={description} />}
    </Card>
  );
};

export default StationCard;
