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
} from "@nextui-org/react"; // For table components
import DashboardCountContainer from "../../../components/dashboardCountContainer";
import ColumnChart from "../../../components/charts/ColumnChart";
import LineChart from "../../../components/charts/LineChart";
import AdminTaskPieChart from "../../../components/charts/AdminTaskPieChart";

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

// NEW: interface for condition data
interface ConditionCount {
  client_condition: string; // 'permanent residence' | 'temporary' | 'deceased'
  count: number;
}

const Dashboard: React.FC = () => {
  /**
   * State Variables with Proper Typing
   */
  const [countData, setCountData] = useState<CountData[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]);
  
  // NEW: condition data for showing permanent/temporary/deceased
  const [conditionData, setConditionData] = useState<ConditionCount[]>([]);

  const [, setMedicineCount] = useState<number>(0); // if needed
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State Variables
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  /**
   * Fetch Data on Component Mount and When Filters Change
   */
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params: Record<string, string> = {};
        if (selectedMonth) params.month = selectedMonth;
        if (selectedYear) params.year = selectedYear;

        const queryString = new URLSearchParams(params).toString();
        const baseURL = `https://health-center-repo-production.up.railway.app/admin`;

        // Define which endpoints require date filters
        const endpointsRequiringDateFilters = [
          'count-total-clients',
          'recent-clients',
          'new-registered',
          'age-segmentation',
          'updates-line-graph',
          'condition-count', // NEW: if you create /admin/condition-count
        ];

        // Function to build URLs with query strings only for endpoints that support date filters
        const buildURL = (endpoint: string) => {
          if (endpointsRequiringDateFilters.includes(endpoint) && queryString) {
            return `${baseURL}/${endpoint}?${queryString}`;
          }
          return `${baseURL}/${endpoint}`;
        };

        // Fetch all necessary data concurrently
        const [
          totalClientsRes,
          totalWorkerRes,
          maleClientsRes,
          femaleClientsRes,
          recentClientsRes,
          newRegisteredRes,
          categoryCountRes,
          ageSegmentationRes,
          updatesRes,
          medicineCountRes,
          conditionRes, // NEW
        ] = await Promise.all([
          axios.get(buildURL('count-total-clients')),
          axios.get(buildURL('count-worker')),          // no date filters
          axios.get(buildURL('count-male-clients')),    // no date filters
          axios.get(buildURL('count-female-clients')),  // no date filters
          axios.get(buildURL('recent-clients')),
          axios.get(buildURL('new-registered')),
          axios.get(buildURL('category-count')),        // no date filters
          axios.get(buildURL('age-segmentation')),      // filters
          axios.get(buildURL('updates-line-graph')),
          axios.get(buildURL('count-medicines')),       // no date filters
          axios.get(buildURL('condition-count')),       // NEW (must exist on server)
        ]);

        // Log responses if needed
        console.log("Total Clients:", totalClientsRes.data);
        console.log("Total Workers:", totalWorkerRes.data);
        console.log("Male Clients:", maleClientsRes.data);
        console.log("Female Clients:", femaleClientsRes.data);
        console.log("Recent Clients:", recentClientsRes.data);
        console.log("New Registered:", newRegisteredRes.data);
        console.log("Category Count:", categoryCountRes.data);
        console.log("Age Segmentation:", ageSegmentationRes.data);
        console.log("Updates:", updatesRes.data);
        console.log("Medicine Count:", medicineCountRes.data);
        console.log("Condition Count:", conditionRes.data);

        /**
         * Set Count Data
         */
        setCountData([
          {
            label: "Total Workers",
            value: totalWorkerRes.data.totalWorkers,
            description: "Number of active workers.",
            active: true,
            withVariant: {
              male: maleClientsRes.data.maleClients,
              female: femaleClientsRes.data.femaleClients,
            },
          },
          {
            label: "Total Clients",
            value: totalClientsRes.data.totalClients,
            description: "Total number of clients.",
            active: false,
          },
          {
            label: "Medicine",
            value: medicineCountRes.data.count,
            description: "Total number of medicines.",
            active: false,
          },
        ]);

        setMedicineCount(medicineCountRes.data.count);

        // Set Recent Clients
        setRecentClients(recentClientsRes.data);

        // Set New Registered Data
        setNewRegisteredData(newRegisteredRes.data);

        // Set Category Data
        setCategoryData(categoryCountRes.data);

        // Set Age Segmentation Data
        setAgeSegmentationData(ageSegmentationRes.data);

        // Set Updates Data
        setUpdatesData(updatesRes.data);

        // NEW: Condition Data
        setConditionData(conditionRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [selectedMonth, selectedYear]);

  /**
   * Prepare Data for Line Charts
   */
  const linegraph1 = useMemo(() => {
    return [
      {
        name: "New Registrations",
        data: newRegisteredData.map((entry) => ({
          x: new Date(entry.day).toLocaleDateString(),
          y: entry.count,
        })),
        color: "#7638FD",
        fillColor: "rgba(118, 56, 253, 0.3)",
      },
    ];
  }, [newRegisteredData]);

  const linegraph2 = useMemo(() => {
    return [
      {
        name: "Updates",
        data: updatesData.map((entry) => ({
          x: new Date(entry.date).toLocaleDateString(),
          y: entry.count,
        })),
        color: "#22c55e",
        fillColor: "rgba(34, 197, 94, 0.3)",
      },
    ];
  }, [updatesData]);

  /**
   * Prepare Data for Pie Chart
   */
  const taskData = categoryData.map((category) => category.count);
  const taskLabels = categoryData.map((category) => category.category_name);

  /**
   *  NEW: Condition Chart Data
   *  Always show permanent residence, temporary, deceased
   */
  const conditionChartData = useMemo(() => {
    if (!conditionData) return [];

    // 1) Define fixed categories
    const fixedCategories = ["permanent residence", "temporary", "deceased"];

    // 2) Dictionary for default zero
    const categoryDict: Record<string, number> = {
      "permanent residence": 0,
      "temporary": 0,
      "deceased": 0,
    };

    // 3) Fill in actual data from server
    conditionData.forEach((item) => {
      categoryDict[item.client_condition] = item.count;
    });

    // 4) Convert to single-series array
    const mergedArray = fixedCategories.map((cat) => ({
      x: cat,
      y: categoryDict[cat] || 0,
    }));

    // 5) Return final single-series
    return [
      {
        name: "Clients by Condition",
        color: "#3B82F6",
        data: mergedArray,
      },
    ];
  }, [conditionData]);

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
        {/* 1) Age Segmentation (Left Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          {ageSegmentationData.length > 0 ? (
            <ColumnChart data={ageSegmentationData} height={350} />
          ) : (
            <div className="text-center text-gray-500">
              No age segmentation data available for the selected period.
            </div>
          )}
        </div>

        {/* 2) Clients by Condition (Middle Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">Clients by Condition</h1>
          {conditionChartData.length > 0 ? (
            <ColumnChart data={conditionChartData} height={350} />
          ) : (
            <div className="text-center text-gray-500">
              No condition data available for the selected period.
            </div>
          )}
        </div>

        {/* 3) Recent Clients (Right Column) */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold mb-3 pl-2">Recent Clients</h1>
          {recentClients.length > 0 ? (
            <Table isStriped aria-label="Recent Clients Table">
              <TableHeader>
                <TableColumn className="text-lg text-black py-3 pl-3">No.</TableColumn>
                <TableColumn className="text-lg text-black py-3 pl-3">Name</TableColumn>
                <TableColumn className="text-lg text-black py-3 pl-3">Purpose</TableColumn>
              </TableHeader>
              <TableBody>
                {recentClients.map((client, index) => (
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
            <AdminTaskPieChart taskData={taskData} taskLabels={taskLabels} />
          ) : (
            <div className="text-center text-gray-500">No category data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
