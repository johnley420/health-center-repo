import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { week } from "../../../constants";
import { lineGraphData, recentClient } from "../../../services/Data";
import DashboardCountContainer from "../../../components/dashboardCountContainer";
import ColumnChart from "../../../components/charts/ColumnChart";
import LineChart from "../../../components/charts/LineChart";
import TaskPieChart from "../../../components/charts/PieChart";

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
          <h1 className="text-xl font-bold">Age Segmentation</h1>

          <ColumnChart data={sampleData} height={350} />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold mb-3 pl-2">Recent Client</h1>

          <Table isStriped aria-label="Example static collection table">
            <TableHeader>
              <TableColumn className="text-lg text-black py-3 pl-3">
                No.
              </TableColumn>
              <TableColumn className="text-lg text-black py-3 pl-3">
                Name
              </TableColumn>
              <TableColumn className="text-lg text-black py-3 pl-3">
                Purpose
              </TableColumn>
            </TableHeader>
            <TableBody>
              {recentClient?.map((user: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-base text-black font-bold py-3 pl-3">
                    {index + 1}.
                  </TableCell>
                  <TableCell className="text-base text-black py-3 pl-3">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-base text-black py-3 pl-3">
                    {user.purpose}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
