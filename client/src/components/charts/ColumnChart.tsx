import React from "react";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface ColumnChartProps {
  data: { day: string; completed: number; pending: number }[];
}

const ColumnChart: React.FC<ColumnChartProps> = ({ data }) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      width: 800,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data?.map((item) => item.day),
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + " Client";
        },
      },
    },
  };

  const series = [
    {
      name: "Completed",
      data: data?.map((item) => item.completed),
    },
    {
      name: "Pending",
      data: data?.map((item) => item.pending),
    },
  ];

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export default ColumnChart;
