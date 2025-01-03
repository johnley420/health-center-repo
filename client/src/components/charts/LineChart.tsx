// src/components/charts/LineChart.tsx

import { ApexOptions } from "apexcharts";
import React from "react";
import Chart from "react-apexcharts";

/**
 * Type Definitions
 */

// Interface for line graph data
interface LineGraphData {
  name: string;
  data: { x: string; y: number }[];
  color: string;
  fillColor: string;
}

interface LineChartProps {
  data: LineGraphData[];
  sizeHeight: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, sizeHeight }) => {
const chartOptions: ApexOptions = {
    chart: {
      type: "line" as const, // Explicit type assertion
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    xaxis: {
      type: "category",
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
    colors: data.map((series) => series.color),
  };

  const chartSeries = data.map((series) => ({
    name: series.name,
    data: series.data,
  }));

  return (
    <Chart
      options={chartOptions}
      series={chartSeries}
      type="line" // Must match the type in chartOptions
      height={sizeHeight}
    />
  );
};

export default LineChart;
