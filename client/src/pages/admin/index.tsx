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
      value: 76,
      description: "Lorem ipsum dolor sit.",
      active: true,
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
    { day: "Monday", completed: 20, pending: 5 },
    { day: "Tuesday", completed: 30, pending: 15 },
    { day: "Wednesday", completed: 25, pending: 10 },
    { day: "Thursday", completed: 40, pending: 20 },
    { day: "Friday", completed: 35, pending: 10 },
    { day: "Saturday", completed: 50, pending: 5 },
    { day: "Sunday", completed: 60, pending: 0 },
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

  // recent

  return (
    <div className="">
      <DashboardCountContainer data={countData} />
      <div className="w-full grid grid-cols-3 gap-3 mt-3">
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation</h1>

          <ColumnChart data={sampleData} />
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
          <TaskPieChart completedTasks={45} pendingTasks={65} />
        </div>
      </div>
    </div>
  );
};

export default index;
