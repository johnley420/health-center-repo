// src/pages/admin/dashboards/index.tsx

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import DashboardCountContainer from "../../../components/dashboardCountContainer";
import ColumnChart from "../../../components/charts/ColumnChart";
import LineChart from "../../../components/charts/LineChart";
import TaskPieChart from "../../../components/charts/PieChart";

/**
 * Type Definitions
 */

// Interface for count data displayed in DashboardCountContainer
interface CountData {
  label: string;
  value: number;
  description: string;
  active: boolean;
  withVariant?: {
    male: number;
    female: number;
  };
}

// Interface for recent clients data
interface RecentClient {
  fname: string;
  category_name: string;
  date_registered: string;
}

// Interface for new registered entries
interface NewRegisteredEntry {
  day: string;
  count: number;
}

// Interface for category count data
interface CategoryCount {
  category_name: string;
  count: number;
}

// Interface for age segmentation data
interface AgeSegmentation {
  ageGroup: string;
  male: number;
  female: number;
}

// Interface for updates data
interface UpdatesData {
  date: string;
  count: number;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_BASE_URL?: string;
      // Add other environment variables here if needed
    }
  }
}

const WorkerDashboard: React.FC = () => {
  /**
   * State Variables with Proper Typing
   */
  const [countData, setCountData] = useState<CountData[]>([
    {
      label: "Total Clients",
      value: 0,
      description: "Lorem ipsum dolor sit.",
      active: true,
      withVariant: {
        male: 0,
        female: 0,
      },
    },
    {
      label: "Total Categories",
      value: 13,
      description: "Lorem ipsum dolor sit.",
      active: false,
    },
  ]);
  const [filteredRecentClients, setFilteredRecentClients] = useState<RecentClient[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]); // New state for updates

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State Variables
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  /**
   * Fetch Data on Component Mount and When Filters Change
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerId = sessionStorage.getItem("id");

        if (!workerId) {
          setError("Worker ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Build query parameters
        const params: Record<string, string> = { worker_id: workerId };
        if (selectedMonth) params.month = selectedMonth;
        if (selectedYear) params.year = selectedYear;

        const baseURL = `https://health-center-repo-production.up.railway.app`;

        // Define which endpoints require date filters
        const endpointsRequiringDateFilters = [
          'count-total-clients',
          'count-male-clients',
          'count-female-clients',
          'recent-clients',
          'new-registered',
          'category-count',
          'age-segmentation',
          'updates-line-graph',
        ];

        // Function to build URLs with query strings only for endpoints that support date filters
        const buildURL = (endpoint: string) => {
          if (endpointsRequiringDateFilters.includes(endpoint) && (selectedMonth || selectedYear)) {
            // Include only the relevant query parameters for date filters
            const urlParams: Record<string, string> = { worker_id: workerId };
            if (selectedMonth) urlParams.month = selectedMonth;
            if (selectedYear) urlParams.year = selectedYear;
            const urlQuery = new URLSearchParams(urlParams).toString();
            return `${baseURL}/${endpoint}?${urlQuery}`;
          }
          // For endpoints that don't require date filters or no filters selected
          return `${baseURL}/${endpoint}?worker_id=${workerId}`;
        };

        // Fetch all necessary data concurrently
        const [
          totalResponse,
          maleResponse,
          femaleResponse,
          recentClientsResponse,
          newRegisteredResponse,
          categoryResponse,
          ageSegmentationResponse,
          updatesResponse,
        ] = await Promise.all([
          axios.get(buildURL('count-total-clients')),
          axios.get(buildURL('count-male-clients')),
          axios.get(buildURL('count-female-clients')),
          axios.get(buildURL('recent-clients')),
          axios.get(buildURL('new-registered')),
          axios.get(buildURL('category-count')),
          axios.get(buildURL('age-segmentation')),
          axios.get(buildURL('updates-line-graph')),
        ]);

        /**
         * Set Count Data
         * - Total Clients: Fetched from API
         * - Male and Female Clients: Fetched from API
         * - Total Categories: Derived from category count length
         */
        const totalClients = parseInt(totalResponse.data.totalClients, 10);
        const maleClients = parseInt(maleResponse.data.maleClients, 10);
        const femaleClients = parseInt(femaleResponse.data.femaleClients, 10);

        setCountData([
          {
            label: "Total Clients",
            value: totalClients,
            description: "Lorem ipsum dolor sit.",
            active: true,
            withVariant: {
              male: maleClients,
              female: femaleClients,
            },
          },
          {
            label: "Total Categories",
            value: categoryResponse.data.length,
            description: "Lorem ipsum dolor sit.",
            active: false,
          },
        ]);

        // Set Recent Clients
        setFilteredRecentClients(recentClientsResponse.data);

        // Set New Registered Data
        setNewRegisteredData(newRegisteredResponse.data);

        // Set Category Data
        setCategoryData(categoryResponse.data);

        // Set Age Segmentation Data
        setAgeSegmentationData(ageSegmentationResponse.data);

        // Set Updates Data
        setUpdatesData(updatesResponse.data);

        // Data fetching complete
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching client data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  /**
   * Prepare Data for Line Charts
   */

  // Line Graph 1: New Registrations Over Time
  const linegraph1 = useMemo(() => [
    {
      name: "New Registrations",
      data: newRegisteredData.map((entry) => ({
        x: new Date(entry.day).toLocaleDateString(),
        y: entry.count,
      })),
      color: "#7638FD",
      fillColor: "rgba(118, 56, 253, 0.3)",
    },
  ], [newRegisteredData]);

  // Line Graph 2: Updates Over Time
  const linegraph2 = useMemo(() => [
    {
      name: "Updates",
      data: updatesData.map((entry) => ({
        x: new Date(entry.date).toLocaleDateString(),
        y: entry.count,
      })),
      color: "#22c55e",
      fillColor: "rgba(34, 197, 94, 0.3)",
    },
  ], [updatesData]);

  /**
   * Prepare Data for Pie Chart
   */
  const taskData = categoryData.map((category) => category.count);
  const taskLabels = categoryData.map((category) => category.category_name);

  /**
   * Render Loading or Error States
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-red-500 text-xl">{error}</span>
      </div>
    );
  }

  /**
   * Main Dashboard Render
   */
  return (
    <div className="p-3">
      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Month Selector */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            id="month"
            name="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Years</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedMonth('');
              setSelectedYear('');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Dashboard Counts */}
      <DashboardCountContainer data={countData} />

      {/* Dashboard Charts and Tables */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {/* Age Segmentation */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white md:col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          {ageSegmentationData.length > 0 ? (
            <ColumnChart data={ageSegmentationData} height={350} />
          ) : (
            <div className="text-center text-gray-500">No age segmentation data available for the selected period.</div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white w-full h-96 overflow-y-auto">
          <h1 className="text-xl font-bold mb-3 pl-2">Recent Clients</h1>
          {filteredRecentClients.length > 0 ? (
            <Table isStriped aria-label="Recent Clients Table">
              <TableHeader>
                <TableColumn className="text-lg text-black py-3 pl-3">No.</TableColumn>
                <TableColumn className="text-lg text-black py-3 pl-3">Name</TableColumn>
                <TableColumn className="text-lg text-black py-3 pl-3">Category</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredRecentClients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-base text-black font-bold py-3 pl-3">
                      {index + 1}.
                    </TableCell>
                    <TableCell className="text-base text-black py-3 pl-3">
                      {client.fname}
                    </TableCell>
                    <TableCell className="text-base text-black py-3 pl-3">
                      {client.category_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500">No recent clients found for the selected period.</div>
          )}
        </div>

        {/* New Registrations */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">New Registrations</h1>
          {newRegisteredData.length > 0 ? (
            <LineChart data={linegraph1} sizeHeight={350} />
          ) : (
            <div className="text-center text-gray-500">No new registrations for the selected period.</div>
          )}
        </div>

        {/* Updates */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">Updates</h1>
          {updatesData.length > 0 ? (
            <LineChart data={linegraph2} sizeHeight={350} />
          ) : (
            <div className="text-center text-gray-500">No updates for the selected period.</div>
          )}
        </div>

        {/* Percentage of Categories */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white overflow-hidden">
          <h1 className="text-xl font-bold">Percentage of Categories</h1>
          {categoryData.length > 0 ? (
            <TaskPieChart taskData={taskData} taskLabels={taskLabels} />
          ) : (
            <div className="text-center text-gray-500">No category data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
