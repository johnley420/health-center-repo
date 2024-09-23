import React from "react";

import ReactApexChart from "react-apexcharts";

interface ApexChartProps {
  data: any[];
  sizeHeight: number;
}

const LineChart: React.FC<ApexChartProps> = ({ data, sizeHeight }) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      type: "category",
      categories: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return Math.round(val).toString();
        },
      },
      tickAmount: 5,
      forceNiceScale: true,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
      y: {
        formatter: function (val) {
          return val.toFixed(1);
        },
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={data}
        type="area"
        height={sizeHeight}
      />
    </div>
  );
};
export default LineChart;
