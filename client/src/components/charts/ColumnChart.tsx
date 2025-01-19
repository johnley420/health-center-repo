// src/components/charts/ColumnChart.tsx

import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

/**
 * 1) Age segmentation shape
 */
interface AgeSegmentation {
  ageGroup: string;
  male: number;
  female: number;
}

/**
 * 2) Single-series shape (e.g., condition data)
 */
interface SingleSeriesPoint {
  x: string; // label on x-axis
  y: number; // bar height
}

interface SingleSeries {
  name: string;            
  data: SingleSeriesPoint[];  
  color?: string;           
}

/**
 * 3) Union type for chart data
 */
type ChartData = AgeSegmentation[] | SingleSeries[];

/**
 * 4) Props
 */
interface ColumnChartProps {
  data: ChartData;
  height: number;
}

const ColumnChart: React.FC<ColumnChartProps> = ({ data, height }) => {
  // Type guards
  const isAgeSegmentation = (d: ChartData): d is AgeSegmentation[] =>
    d.length > 0 && (d[0] as AgeSegmentation).ageGroup !== undefined;

  const isSingleSeries = (d: ChartData): d is SingleSeries[] =>
    d.length > 0 && (d[0] as SingleSeries).name !== undefined;

  let categories: string[] = [];
  let series: ApexOptions["series"] = [];

  if (isAgeSegmentation(data)) {
    // Age Segmentation (male/female)
    categories = data.map((item) => item.ageGroup);
    series = [
      {
        name: "Male",
        data: data.map((item) => item.male),
      },
      {
        name: "Female",
        data: data.map((item) => item.female),
      },
    ];
  } else if (isSingleSeries(data)) {
    // Single-series (condition, etc.)
    const firstSeries = data[0];
    categories = firstSeries.data.map((p) => p.x);

    series = data.map((s) => ({
      name: s.name,
      data: s.data.map((p) => p.y),
      color: s.color,
    }));
  }

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%" },
    },
    dataLabels: { enabled: false },
    xaxis: { categories },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Clients`,
      },
    },
  };

  return <Chart type="bar" options={options} series={series} height={height} />;
};

export default ColumnChart;
