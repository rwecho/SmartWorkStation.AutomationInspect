export interface CheckPointData {
  point: number;
  index: number;
  screwTorque: number;
  meterTorque: number;
}

export interface AgingData {
  index: number;
  screwTorque: number;
  meterTorque: number;
}

export interface CheckRecord {
  id: number;
  startTime: string;
  endTime: string;
  name: string;
  kp: number;
  b: number;
  pointData: CheckPointData[];
  agingData: AgingData[];
}
