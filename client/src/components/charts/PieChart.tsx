import React from "react";
import Chart from "react-apexcharts";

interface TaskPieChartProps {
  taskData: number[]; // Array to hold task data for categories
}

const TaskPieChart: React.FC<TaskPieChartProps> = ({ taskData }) => {
  const chartOptions = {
    labels: [
      "Category 1",
      "Category 2",
      "Category 3",
      "Category 4",
      "Category 5",
      "Category 6",
      "Category 7",
      "Category 8",
      "Category 9",
      "Category 10",
      "Category 11",
      "Category 12",
      "Category 13",
    ],
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
  };

  const chartSeries = taskData; // Data for 13 categories

  return (
    <Chart options={chartOptions} series={chartSeries} type="pie" width="450" />
  );
};

export default TaskPieChart;
