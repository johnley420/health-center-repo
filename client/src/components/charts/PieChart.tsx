import React from "react";
import Chart from "react-apexcharts";
interface TaskPieChartProps {
  completedTasks: number;
  pendingTasks: number;
}

const TaskPieChart: React.FC<TaskPieChartProps> = ({
  completedTasks,
  pendingTasks,
}) => {
  const chartOptions = {
    labels: ["Completed", "Pending"],
    colors: ["#50ACFE", "#8765F6"],
    legend: {
      show: true,
      position: "bottom" as const, // Specify the position as a constant
    },
  };

  const chartSeries = [completedTasks, pendingTasks];

  return (
    <Chart options={chartOptions} series={chartSeries} type="pie" width="450" />
  );
};

export default TaskPieChart;
