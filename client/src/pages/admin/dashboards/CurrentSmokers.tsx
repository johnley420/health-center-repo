import React from "react";
import CategoryDashboard from "../../../components/dashboard/CategoryDashboard";
import { week } from "../../../constants";
import { lineGraphData } from "../../../services/Data";

const CurrentSmokers = () => {
  const sampleData = [
    { day: "Monday", male: 12, female: 7 },
    { day: "Tuesday", male: 20, female: 5 },
    { day: "Wednesday", male: 15, female: 15 },
    { day: "Thursday", male: 10, female: 20 },
    { day: "Friday", male: 15, female: 10 },
    { day: "Saturday", male: 50, female: 9 },
    { day: "Sunday", male: 30, female: 0 },
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
      value: 32,
      description: "Lorem ipsum dolor sit.",
      active: true,
      withVariant: {
        male: 52,
        female: 20,
      },
    },

    {
      label: " Medicine",
      value: 36,
      description: "Lorem ipsum dolor sit.",
      active: false,
    },
  ];
  return (
    <CategoryDashboard
      countData={countData}
      linegraph1={linegraph1}
      linegraph2={linegraph2}
      sampleData={sampleData}
    />
  );
};

export default CurrentSmokers;
