import React from "react";
import DashboardCountContainer from "../../components/dashboardCountContainer";
import ColumnChart from "../../components/charts/ColumnChart";
import TaskPieChart from "../../components/charts/PieChart";
import LineChart from "../../components/charts/LineChart";
import { lineGraphData, recentClient } from "../../services/Data";
import { week } from "../../constants";

const index = () => {
  const countData = [
    {
      label: "Total Workers",
      value: 72,
      description: "Lorem ipsum dolor sit.",
      active: true,
      withVariant: {
        male: 52,
        female: 20,
      },
    },
    {
      label: "Total Clients",
      value: 76,

      description: "Lorem ipsum dolor sit.",
      active: false,
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

  const sampleData = [
    { day: "Monday", male: 20, female: 5 },
    { day: "Tuesday", male: 30, female: 15 },
    { day: "Wednesday", male: 25, female: 10 },
    { day: "Thursday", male: 40, female: 20 },
    { day: "Friday", male: 35, female: 10 },
    { day: "Saturday", male: 50, female: 5 },
    { day: "Sunday", male: 60, female: 0 },
  ];

  // line gerapj
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

  // category
  const taskData = [10, 20, 15, 5, 8, 12, 6, 18, 9, 14, 11, 17, 13];

  return (
    <div className="">
      <DashboardCountContainer data={countData} />
      <div className="w-full grid grid-cols-3 gap-3 mt-3">
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation(5-9 yrs old)</h1>

          <ColumnChart data={sampleData} height={350} />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">Recent Client</h1>
          <table className="w-full">
            <thead>
              <tr className="h-14">
                <th className="text-left pl-2 text-lg font-semibold  tracking-wider">
                  No.
                </th>
                <th className="text-left pl-2 text-lg font-semibold  tracking-wider">
                  Name
                </th>
                <th className="text-left pl-2 text-lg font-semibold  tracking-wider">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody>
              {recentClient.map((item, index) => (
                <tr className="h-16">
                  <td className="markOdd text-left pl-2 text-lg text-gray-500 font-bold tracking-wider">
                    {index + 1}.
                  </td>
                  <td className="markOdd text-left pl-2 text-lg text-gray-500 font-medium tracking-wider">
                    {item.name}
                  </td>
                  <td className="markOdd text-left pl-2 text-lg text-gray-500 font-medium tracking-wider">
                    {item.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">
            {" "}
            <h1 className="text-xl font-bold"> New Registereds</h1>
          </h1>

          <LineChart data={linegraph1} sizeHeight={350} />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">Updated</h1>
          <LineChart data={linegraph2} sizeHeight={350} />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">Percentage of Categories</h1>
          <TaskPieChart taskData={taskData} />
        </div>
      </div>
    </div>
  );
};

export default index;
