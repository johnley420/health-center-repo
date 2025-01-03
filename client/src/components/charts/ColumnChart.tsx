import React from "react";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface ColumnChartProps {
  data: { ageGroup: string; male: number; female: number }[];
  height: number;
}

const ColumnChart: React.FC<ColumnChartProps> = ({ data, height }) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: height,
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
      categories: data.map((item) => item.ageGroup),
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Clients`,
      },
    },
  };

  const series = [
    {
      name: "Male",
      data: data.map((item) => item.male),
    },
    {
      name: "Female",
      data: data.map((item) => item.female),
    },
  ];

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default ColumnChart;
