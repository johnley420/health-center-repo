import React from "react";
import DashboardCountContainer from "../../components/dashboardCountContainer";
import ColumnChart from "../../components/charts/ColumnChart";
import LineChart from "../../components/charts/LineChart";
import { lineGraphData } from "../../services/Data";
import { week } from "../../constants";
import CategoryPieChart from "../../components/charts/PieChartWithMultiple";
import RegisteredUserLineGraph from "../../components/charts/LineChartRegisted";

const index = () => {
  const countData = [
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

  const categoryChartData = [
    { category: "Category 1", percentage: 20 },
    { category: "Category 2", percentage: 30 },
    { category: "Category 3", percentage: 15 },
    { category: "Category 4", percentage: 25 },
    { category: "Category 5", percentage: 10 },
    { category: "Category 6", percentage: 5 },
    { category: "Category 7", percentage: 10 },
  ];

  return (
    <div className="">
      <DashboardCountContainer data={countData} />
      <div className="w-full grid grid-cols-3 gap-3 mt-3">
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]  bg-white col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation</h1>

          <ColumnChart data={sampleData} height={350} />
        </div>

        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">
            {" "}
            <h1 className="text-xl font-bold">Percentage of Category</h1>
          </h1>

          <CategoryPieChart data={categoryChartData} />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] col-span-2   bg-white">
          <h1 className="text-xl font-bold">New Registered</h1>
          <RegisteredUserLineGraph />
        </div>
        <div className=" p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7]   bg-white">
          <h1 className="text-xl font-bold">Updated</h1>
          <LineChart data={linegraph2} sizeHeight={350} />
        </div>
      </div>
    </div>
  );
};

export default index;
