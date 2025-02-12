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

interface RecentClient {
  fname: string;
  category_name: string;
  date_registered: string;
}

interface NewRegisteredEntry {
  day: string;
  count: number;
}

interface CategoryCount {
  category_name: string;
  count: number;
}

interface AgeSegmentation {
  ageGroup: string;
  male: number;
  female: number;
}

interface UpdatesData {
  date: string;
  count: number;
}

interface ConditionCount {
  client_condition: string;
  count: number;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_BASE_URL?: string;
    }
  }
}

const WorkerDashboard: React.FC = () => {
  // State Variables for dashboard data
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
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]);
  const [conditionData, setConditionData] = useState<ConditionCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Date Range Filter State Variables
  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');

  // Fetch Data on Component Mount and When Filters Change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerId = sessionStorage.getItem("id");

        if (!workerId) {
          setError("Worker ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Build query parameters using the new date range filter
        const params: Record<string, string> = { worker_id: workerId };
        if (selectedFrom) params.from = selectedFrom;
        if (selectedTo) params.to = selectedTo;

        const baseURL = `https://health-center-repo-production.up.railway.app`;

        // Define endpoints that support date filtering
        const endpointsRequiringDateFilters = [
          'count-total-clients',
          'count-male-clients',
          'count-female-clients',
          'recent-clients',
          'new-registered',
          'category-count',
          'age-segmentation',
          'updates-line-graph',
          'condition-count',
        ];

        // Function to build URLs with query parameters
        const buildURL = (endpoint: string) => {
          if (
            endpointsRequiringDateFilters.includes(endpoint) &&
            (selectedFrom || selectedTo)
          ) {
            const urlParams: Record<string, string> = { worker_id: workerId };
            if (selectedFrom) urlParams.from = selectedFrom;
            if (selectedTo) urlParams.to = selectedTo;
            const urlQuery = new URLSearchParams(urlParams).toString();
            return `${baseURL}/${endpoint}?${urlQuery}`;
          }
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
          conditionResponse,
        ] = await Promise.all([
          axios.get(buildURL('count-total-clients')),
          axios.get(buildURL('count-male-clients')),
          axios.get(buildURL('count-female-clients')),
          axios.get(buildURL('recent-clients')),
          axios.get(buildURL('new-registered')),
          axios.get(buildURL('category-count')),
          axios.get(buildURL('age-segmentation')),
          axios.get(buildURL('updates-line-graph')),
          axios.get(buildURL('condition-count')),
        ]);

        // Set Count Data
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

        // Set other dashboard data
        setFilteredRecentClients(recentClientsResponse.data);
        setNewRegisteredData(newRegisteredResponse.data);
        setCategoryData(categoryResponse.data);
        setAgeSegmentationData(ageSegmentationResponse.data);
        setUpdatesData(updatesResponse.data);
        setConditionData(conditionResponse.data);

        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching client data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFrom, selectedTo]);

  // Prepare Data for Line Charts
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

  // Prepare Data for Pie Chart (Categories)
  const taskData = categoryData.map((category) => category.count);
  const taskLabels = categoryData.map((category) => category.category_name);

  // Merge Condition Data With Fixed Categories
  const conditionChartData = useMemo(() => {
    if (!conditionData) return [];

    const fixedCategories = ["permanent residence", "temporary", "deceased", "transfer"];
    const categoryDict: Record<string, number> = {
      "permanent residence": 0,
      temporary: 0,
      deceased: 0,
    };

    conditionData.forEach((item) => {
      categoryDict[item.client_condition] = item.count;
    });

    const mergedArray = fixedCategories.map((cat) => ({
      x: cat,
      y: categoryDict[cat] || 0,
    }));

    return [
      {
        name: "Clients by Condition",
        color: "#3B82F6",
        data: mergedArray,
      },
    ];
  }, [conditionData]);

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

  return (
    <div className="p-3">
      {/* Updated Filter Section: Date Range Picker */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* From Date Picker */}
        <div>
          <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
            From
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            value={selectedFrom}
            onChange={(e) => setSelectedFrom(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        {/* To Date Picker */}
        <div>
          <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedFrom('');
              setSelectedTo('');
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
        {/* Age Segmentation (Left Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white md:col-span-1">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          {ageSegmentationData.length > 0 ? (
            <ColumnChart data={ageSegmentationData} height={350} />
          ) : (
            <div className="text-center text-gray-500">
              No age segmentation data available for the selected period.
            </div>
          )}
        </div>

        {/* Clients by Condition (Middle Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white md:col-span-1">
          <h1 className="text-xl font-bold">Clients by Condition</h1>
          {conditionChartData.length > 0 ? (
            <ColumnChart data={conditionChartData} height={350} />
          ) : (
            <div className="text-center text-gray-500">
              No condition data available for the selected period.
            </div>
          )}
        </div>

        {/* Recent Clients (Right Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white w-full h-96 overflow-y-auto md:col-span-1">
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
            <div className="text-center text-gray-500">
              No recent clients found for the selected period.
            </div>
          )}
        </div>

        {/* New Registrations */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">New Registrations</h1>
          {newRegisteredData.length > 0 ? (
            <LineChart data={linegraph1} sizeHeight={350} />
          ) : (
            <div className="text-center text-gray-500">
              No new registrations for the selected period.
            </div>
          )}
        </div>

        {/* Updates */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">Updates</h1>
          {updatesData.length > 0 ? (
            <LineChart data={linegraph2} sizeHeight={350} />
          ) : (
            <div className="text-center text-gray-500">
              No updates for the selected period.
            </div>
          )}
        </div>

        {/* Percentage of Categories */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white overflow-hidden">
          <h1 className="text-xl font-bold">Percentage of Categories</h1>
          {categoryData.length > 0 ? (
            <TaskPieChart taskData={taskData} taskLabels={taskLabels} />
          ) : (
            <div className="text-center text-gray-500">
              No category data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
