export interface CountData {
  label: string;
  value: number;
  description: string;
  active: boolean;
  withVariant?: {
    female: number;
  };
}

export interface AgeSegmentationData {
  label: string;
  value: number;
}

export interface LineGraphData {
  name: string;
  data: { x: string; y: number }[];
  color: string;
  fillColor: string;
}