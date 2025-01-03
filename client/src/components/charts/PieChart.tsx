import React from "react";
import Chart from "react-apexcharts";

interface TaskPieChartProps {
  taskData: number[]; // Array to hold task data for categories
  taskLabels: string[]; // Array to hold labels for each category
}

const TaskPieChart: React.FC<TaskPieChartProps> = ({ taskData, taskLabels }) => {
  const chartOptions = {
    labels: taskLabels.map(label => label.length > 20 ? label.slice(0, 17) + '...' : label), // Use labels from props for hover display
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
      position: "bottom" as const, // Specify the position as a constant
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
          return `${taskLabels[seriesIndex].length > 20 ? taskLabels[seriesIndex].slice(0, 17) + '...' : taskLabels[seriesIndex]}: ${val}`;
        },
      },
    },
  };

  const chartSeries = taskData; // Data for categories

  return (
    <Chart options={chartOptions} series={chartSeries} type="pie" width="420" />
  );
};

export default TaskPieChart;
