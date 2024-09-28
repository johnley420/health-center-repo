import React from "react";
import { week } from "../../constants";
import { lineGraphData } from "../../services/Data";
import ColumnChart from "../../components/charts/ColumnChart";
import LineChart from "../../components/charts/LineChart";
import DashboardCountContainer from "../../components/dashboardCountContainer";

const Pregnant = () => {
  const sampleData = [
    { day: "Monday", male: 20, female: 5 },
    { day: "Tuesday", male: 30, female: 15 },
    { day: "Wednesday", male: 25, female: 10 },
    { day: "Thursday", male: 40, female: 20 },
    { day: "Friday", male: 35, female: 10 },
    { day: "Saturday", male: 50, female: 5 },
    { day: "Sunday", male: 60, female: 0 },
  ];
  const linegraph1 = [
    {
      name: "Client",
      data: week.map(
        (item) =>
          lineGraphData.filter((clientItem) => clientItem.day === item).length
      ),
      color: "#7638FD",
      fillColor: "rgba(255, 0, 0, 0.3)",
    },
  ];
  const linegraph2 = [
    {
      name: "Client",
      data: week.map(
        (item) =>
          lineGraphData.filter((clientItem) => clientItem.day === item).length
      ),
      color: "#22c55e",
      fillColor: "rgba(255, 0, 0, 0.3)",
    },
  ];

  //   count box data
  const countData = [
    {
      label: "Total Clients",
      value: 72,
      description: "Lorem ipsum dolor sit.",
      active: true,
      withVariant: {
        male: 52,
        female: 20,
      },
    },

    {
      label: " Medicine",
      value: 76,
      description: "Lorem ipsum dolor sit.",
      active: false,
    },
    {
      label: "Total Workers",
      value: 76,
      description: "Lorem ipsum dolor sit.",
      active: false,
    },
  ];

  return (
    <div>
      <div className="w-full grid grid-rows-4 grid-cols-2 gap-3 mt-3">
        <div className=" p-5  ">
          <DashboardCountContainer data={countData} />
        </div>
        <div className="row-span-2 p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white ">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          <LineChart data={linegraph1} sizeHeight={250} />
        </div>
        <div className="row-span-4 p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white ">
          <h1 className="text-xl font-bold">Updated</h1>
          <ColumnChart data={sampleData} height={0} />
        </div>
        <div className="row-span-2 p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white ">
          <h1 className="text-xl font-bold">New Registered</h1>
          <LineChart data={linegraph2} sizeHeight={250} />
        </div>
      </div>
    </div>
  );
};

export default Pregnant;
