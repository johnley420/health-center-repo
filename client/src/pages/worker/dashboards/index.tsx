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

  /**
   * Fetch Data on Component Mount
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


        // Fetch all necessary data concurrently, including updates data
        const [
          totalResponse,
          maleResponse,
          recentClientsResponse,
          newRegisteredResponse,
          categoryResponse,
          ageSegmentationResponse,
          updatesResponse, // New data
        ] = await Promise.all([
          axios.get(`https://health-center-repo-production.up.railway.app/count-total-clients`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/count-male-clients`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/recent-clients`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/new-registered`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/category-count`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/age-segmentation`, {
            params: { worker_id: workerId },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/updates-line-graph`, { // Fetch updates data
            params: { worker_id: workerId },
          }),
        ]);

        /**
         * Set Count Data
         * - Total Clients: Fetched from API
         * - Male and Female Clients: Calculated from API responses
         * - Total Categories: Derived from category count length
         */
        const totalClients = parseInt(totalResponse.data.totalClients, 10);
        const maleClients = parseInt(maleResponse.data.maleClients, 10);
        const femaleClients = totalClients - maleClients;

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

        // Filter recent clients registered from now until last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentClients = recentClientsResponse.data.filter((client: RecentClient) => {
          const dateRegistered = new Date(client.date_registered);
          return dateRegistered >= oneWeekAgo;
        });

        setFilteredRecentClients(recentClients);

        // Set new registered clients over the timeline
        setNewRegisteredData(newRegisteredResponse.data);

        // Set category data
        setCategoryData(categoryResponse.data);

        // Set age segmentation data
        setAgeSegmentationData(ageSegmentationResponse.data);

        // Set updates data
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
  }, []);

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
      <DashboardCountContainer data={countData} />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {/* Age Segmentation */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white md:col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          <ColumnChart data={ageSegmentationData} height={350} />
        </div>

        {/* Recent Clients */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white w-full h-96 overflow-y-auto">
          <h1 className="text-xl font-bold mb-3 pl-2">Recent Clients</h1>
          <Table isStriped aria-label="Recent Clients Table">
            <TableHeader>
              <TableColumn className="text-lg text-black py-3 pl-3">No.</TableColumn>
              <TableColumn className="text-lg text-black py-3 pl-3">Name</TableColumn>
              <TableColumn className="text-lg text-black py-3 pl-3">Category</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredRecentClients.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="text-base text-black font-bold py-3 pl-3">
                    {index + 1}.
                  </TableCell>
                  <TableCell className="text-base text-black py-3 pl-3">
                    {user.fname}
                  </TableCell>
                  <TableCell className="text-base text-black py-3 pl-3">
                    {user.category_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* New Registrations */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">New Registrations</h1>
          <LineChart data={linegraph1} sizeHeight={350} />
        </div>

        {/* Updates */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold">Updates</h1>
          <LineChart data={linegraph2} sizeHeight={350} />
        </div>

        {/* Percentage of Categories */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white overflow-hidden">
          <h1 className="text-xl font-bold">Percentage of Categories</h1>
          <TaskPieChart taskData={taskData} taskLabels={taskLabels} />
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
