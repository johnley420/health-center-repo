import React from 'react';
import Chart from 'react-apexcharts';

const RegisteredUserLineGraph:React.FC = () => {
  // Dummy data for new and registered users
  const data = {
    categories: [
      '2024-09-01', '2024-09-02', '2024-09-03',
      '2024-09-04', '2024-09-05', '2024-09-06',
      '2024-09-07', '2024-09-08', '2024-09-09',
      '2024-09-10', '2024-09-11', '2024-09-12'
    ],
    series: [
      {
        name: 'New Users',
        data: [5, 15, 10, 20, 25, 15, 30, 35, 40, 30, 20, 25],
      },
      {
        name: 'Registered Users',
        data: [50, 55, 65, 70, 75, 85, 90, 95, 100, 110, 120, 130],
      },
    ],
  };

  const options = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: data.categories,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    colors: ['#00E396', '#0090FF'],
  };

  return (
    <div>
      <Chart options={options} series={data.series} type="line" height={350} />
    </div>
  );
};

export default RegisteredUserLineGraph;
