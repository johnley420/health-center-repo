import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface CategoryData {
  category: string;
  percentage: number;
}

interface PieChartProps {
  data: CategoryData[];
}

const CategoryPieChart: React.FC<PieChartProps> = ({ data }) => {
  const series = data.map(item => item.percentage);
  const labels = data.map(item => item.category);

  const chartOptions: ApexOptions = {
    chart: {
      type: "pie",
      toolbar: {
        show: false,
      },
    },
    labels: labels,
    legend: {
      position: "bottom",
      labels: {
        colors: ["#333"],
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "40%",
        },
      },
    },
  };

  return (
    <div className="p-5 rounded-xl bg-white">
      <Chart options={chartOptions} series={series} type="pie" height={350} />
    </div>
  );
};

export default CategoryPieChart;
