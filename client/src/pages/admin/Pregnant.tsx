import React from "react";
import { week } from "../../constants";
import { lineGraphData } from "../../services/Data";
import ColumnChart from "../../components/charts/ColumnChart";
import LineChart from "../../components/charts/LineChart";
import DashboardCountContainer from "../../components/dashboardCountContainer";

const Pregnant = () => {
  const sampleData = [
    { day: "Monday", completed: 20, pending: 5 },
    { day: "Tuesday", completed: 30, pending: 15 },
    { day: "Wednesday", completed: 25, pending: 10 },
    { day: "Thursday", completed: 40, pending: 20 },
    { day: "Friday", completed: 35, pending: 10 },
    { day: "Saturday", completed: 50, pending: 5 },
    { day: "Sunday", completed: 60, pending: 0 },
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
      label: " Segmentation",
      value: 76,
      description: "Lorem ipsum dolor sit.",
      active: true,
    },
    {
      label: "New Registered",
      value: 76,
      description: "Lorem ipsum dolor sit.",
      active: false,
    },
    {
      label: "Updated",
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
