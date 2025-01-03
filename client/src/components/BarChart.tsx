// src/components/charts/BarChart.tsx

import React from "react";
import Chart from "react-apexcharts";

/**
 * Type Definitions
 */

// Interface for age segmentation data
interface AgeSegmentationData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: AgeSegmentationData[];
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, height }) => {
  const chartOptions = {
    chart: {
      type: "bar" as const, // Explicit type assertion
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: data.map((item) => item.label),
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 10, // Ensure your ApexCharts version supports this
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#22c55e"],
    fill: {
      type: "solid",
      opacity: 0.3,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toString(),
      },
    },
  };

  const chartSeries = [
    {
      name: "Age Group",
      data: data.map((item) => item.value),
    },
  ];

  return (
    <Chart
      options={chartOptions}
      series={chartSeries}
      type="bar" // Must match the type in chartOptions
      height={height}
    />
  );
};

export default BarChart;
