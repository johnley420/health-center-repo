// src/components/charts/AdminPieChart.jsx

import React from "react";
import Chart from "react-apexcharts";

interface AdminTaskPieChartProps {
  taskData: number[];
  taskLabels: string[];
}

const AdminTaskPieChart: React.FC<AdminTaskPieChartProps> = ({ taskData, taskLabels }) => {
  const chartOptions = {
    labels: taskLabels.map(label => label.length > 20 ? label.slice(0, 17) + '...' : label),
    colors: [
      "#50ACFE",
      "#8765F6",
      "#F67280",
      "#C06C84",
      "#6C5B7B",
      "#355C7D",
      "#99B898",
      "#FECEAB",
      "#FF847C",
      "#E84A5F",
      "#2A363B",
      "#A8E6CE",
      "#DCE775",
    ],
    legend: {
      show: true,
      position: "bottom" as const,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
          const label = taskLabels[seriesIndex];
          const truncatedLabel = label.length > 20 ? label.slice(0, 17) + '...' : label;
          return `${truncatedLabel}: ${val}`;
        },
      },
    },
  };

  const chartSeries = taskData;

  return (
    <Chart options={chartOptions} series={chartSeries} type="pie" width="420" />
  );
};

export default AdminTaskPieChart;
