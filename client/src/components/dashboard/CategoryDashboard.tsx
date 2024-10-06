/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { week } from "../../constants";
import { lineGraphData } from "../../services/Data";
import DashboardCountContainer from "../dashboardCountContainer";
import LineChart from "../charts/LineChart";
import ColumnChart from "../charts/ColumnChart";

const CategoryDashboard = ({
  sampleData,
  linegraph1,
  linegraph2,
  countData,
}: {
  sampleData: any;
  linegraph1: any;
  linegraph2: any;
  countData: any;
}) => {
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

export default CategoryDashboard;
