// src/components/dashboard/YearsChildren5to9CategoryDashboard.tsx

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { GoDotFill } from "react-icons/go";

/**
 * Type Definitions
 */

// Interface for count data displayed in CountCard
interface CountData {
  label: string;
  value: number;
  description: string;
  active: boolean;
  withVariants?: {
    male: number;
    female: number;
  };
}

// Interface for age segmentation data
interface AgeSegmentation {
  age_range: string;
  gender: string;
  count: number;
}

// Interface for new registered entries
interface NewRegisteredEntry {
  day: string;
  gender: string;
  count: number;
}

// Interface for updates data
interface UpdatesData {
  date: string;
  client_count: number;
}

// Props for YearsChildren5to9CategoryDashboard
interface YearsChildren5to9CategoryDashboardProps {
  countData: CountData[];
  ageSegmentationData: AgeSegmentation[];
  newRegisteredData: NewRegisteredEntry[];
  updatesData: UpdatesData[];
}

/**
 * YearsChildren5to9CategoryDashboard Component
 */
const YearsChildren5to9CategoryDashboard: React.FC<YearsChildren5to9CategoryDashboardProps> = ({
  countData,
  ageSegmentationData,
  newRegisteredData,
  updatesData,
}) => {
  /**
   * Sub-Component: CountCard
   * Displays total clients with male and female variants
   */
  const CountCard: React.FC<{ data: CountData }> = ({ data }) => {
    return (
      <div
        className={`relative count-box shadow-lg shadow-green-100 rounded-xl border border-green-100 bg-white ${
          data.active ? "border-green-500" : ""
        } 
        /* Responsive Width and Fixed Height */
        w-full sm:w-80 md:w-96 
        h-40 sm:h-35 md:h-40 
        `}
      >
        <div className="p-5 w-full h-full flex flex-col justify-between">
          {/* Grid Layout for Label, Value, Description, and Variants */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Row: Label and Value */}
            <div>
              <h1 className="text-gray-400 tracking-wider">{data.label}</h1>
            </div>
            <div className="flex justify-end">
              <p className="text-4xl font-bold">{data.value}</p>
            </div>

            {/* Second Row: Description and Variants (Male and Female) */}
            <div className="flex justify-end items-center">
              {data.withVariants && (
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <small className="font-semibold text-xl">{data.withVariants.male}</small>
                    <small className="text-gray-400">Male</small>
                  </div>
                  <div className="flex flex-col items-center">
                    <small className="font-semibold text-xl">{data.withVariants.female}</small>
                    <small className="text-gray-400">Female</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1">
            <GoDotFill size={20} className="text-green-500" />
            <p className="text-sm text-gray-500">Active</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Sub-Component: AgeSegmentationBarChart
   * Displays age segmentation data for both genders
   */
  const AgeSegmentationBarChart: React.FC<{ data: AgeSegmentation[]; height: number }> = ({
    data,
    height,
  }) => {
    // Extract unique age ranges
    const ageRanges = Array.from(new Set(data.map((item) => item.age_range)));

    // Extract data for male and female
    const maleData = ageRanges.map((age) => {
      const entry = data.find((item) => item.age_range === age && item.gender === "male");
      return entry ? entry.count : 0;
    });

    const femaleData = ageRanges.map((age) => {
      const entry = data.find((item) => item.age_range === age && item.gender === "female");
      return entry ? entry.count : 0;
    });

    // Define ApexCharts options
    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: height,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ageRanges,
        title: {
          text: "Age Range",
        },
      },
      yaxis: {
        title: {
          text: "Number of Clients",
        },
        min: 0,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} Clients`,
        },
      },
      title: {
        text: "Age Segmentation",
        align: "left" as const,
      },
      colors: ["#22c55e", "#7638FD"], // Male and Female colors
      legend: {
        position: 'top',
      },
    };

    // Define series data
    const series = [
      {
        name: "Male",
        data: maleData,
      },
      {
        name: "Female",
        data: femaleData,
      },
    ];

    return (
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    );
  };

  /**
   * Sub-Component: NewRegisteredLineChart
   * Displays new registered clients over time for both genders
   */
  const NewRegisteredLineChart: React.FC<{ data: NewRegisteredEntry[]; height: number }> = ({
    data,
    height,
  }) => {
    // Extract unique days
    const days = Array.from(new Set(data.map((item) => item.day)));

    // Extract data for male and female
    const maleData = days.map((day) => {
      const entry = data.find((item) => item.day === day && item.gender === "male");
      return entry ? entry.count : 0;
    });

    const femaleData = days.map((day) => {
      const entry = data.find((item) => item.day === day && item.gender === "female");
      return entry ? entry.count : 0;
    });

    // Define ApexCharts options
    const options: ApexOptions = {
      chart: {
        type: "line",
        height: height,
        stacked: false,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        categories: days,
        title: {
          text: "Day",
        },
      },
      yaxis: {
        title: {
          text: "Number of Registrations",
        },
        min: 0,
        forceNiceScale: true,
      },
      markers: {
        size: 5,
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} Registrations`,
        },
      },
      title: {
        text: "New Registrations Over Time",
        align: "left" as const,
      },
      colors: ["#22c55e", "#7638FD"], // Male and Female colors
      legend: {
        position: 'top',
      },
    };

    // Define series data
    const series = [
      {
        name: "Male",
        data: maleData,
      },
      {
        name: "Female",
        data: femaleData,
      },
    ];

    return (
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={height}
      />
    );
  };

  /**
   * Line Chart: Updates
   */
  const updatesLineChartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#22c55e"], // Green color
    },
    xaxis: {
      categories: updatesData.map((data) =>
        new Date(data.date).toLocaleDateString()
      ),
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Number of Updates",
      },
      min: 0,
      forceNiceScale: true,
    },
    markers: {
      size: 5,
      colors: ["#22c55e"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Updates`,
      },
    },
    title: {
      text: "Updates Over Time",
      align: "left" as const,
    },
  };

  const updatesLineChartSeries = [
    {
      name: "Updates",
      data: updatesData.map((data) => data.client_count),
    },
  ];

  return (
    <div className="p-3">
      {/* Count Cards */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5">
        {countData.map((item, index) => (
          <CountCard key={index} data={item} />
        ))}
      </div>

      {/* Charts */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Age Segmentation Bar Chart */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          {ageSegmentationData.length > 0 ? (
            <AgeSegmentationBarChart data={ageSegmentationData} height={350} />
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>

        {/* New Registered Line Chart */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          {newRegisteredData.length > 0 ? (
            <NewRegisteredLineChart data={newRegisteredData} height={350} />
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>

        {/* Updates Line Chart */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          {updatesData.length > 0 ? (
            <ReactApexChart
              options={updatesLineChartOptions}
              series={updatesLineChartSeries}
              type="line"
              height={350}
            />
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearsChildren5to9CategoryDashboard;
