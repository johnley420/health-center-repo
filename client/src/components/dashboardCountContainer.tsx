import React from "react";
import { countTypes } from "../types";
import { GoDotFill } from "react-icons/go";

interface DashboardCountContainerProps {
  data: countTypes[];
}

const DashboardCountContainer: React.FC<DashboardCountContainerProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5">
      {data.map((item, index) =>
        !item.withVariant ? (
          <div
            key={index}
            className="relative count-box w-full shadow-lg shadow-green-100 rounded-xl border border-green-100 bg-white"
          >
            <div className="flex flex-col gap-3 p-5 w-full">
              <h1 className="text-gray-400 tracking-wider">{item.label}</h1>
              <p className="text-4xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <GoDotFill size={25} className="text-green-500" />
                Active
              </p>
            </div>
          </div>
        ) : (
          <div
            key={index}
            className="relative count-box w-full shadow-lg shadow-green-100 rounded-xl border border-green-100 bg-white"
          >
            <div className="flex flex-col gap-3 p-5 w-full">
              <p className="text-gray-400 tracking-wider">{item.label}</p>
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">{item.value}</h1>
                <div className="flex items-center gap-9">
                  <div className="flex flex-col items-center justify-center">
                    <small className="font-semibold text-xl">
                      {item.withVariant?.male}
                    </small>
                    <small className="text-gray-400">Male</small>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <small className="font-semibold text-xl">
                      {item.withVariant?.female}
                    </small>
                    <small className="text-gray-400">Female</small>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <GoDotFill size={25} className="text-green-500" />
                Active
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DashboardCountContainer;
