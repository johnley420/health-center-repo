// Frontend: src/pages/admin/dashboards/index.tsx

import React, { useState, useEffect } from "react";
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

const Dashboard: React.FC = () => {
  /**
   * State Variables with Proper Typing
   */
  const [countData, setCountData] = useState<CountData[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]); // New state for updates
  const [, setMedicineCount] = useState<number>(0); // New state for medicine count
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch Data on Component Mount
   */
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch all necessary data concurrently, including updates data and medicine count
        const [
          totalClientsRes,
          totalWorkerRes,
          maleClientsRes,
          femaleClientsRes,
          recentClientsRes,
          newRegisteredRes,
          categoryCountRes,
          ageSegmentationRes,
          updatesRes, // New data
          medicineCountRes, // New data
        ] = await Promise.all([
          axios.get(`http://localhost:8081/admin/count-total-clients`),
          axios.get(`http://localhost:8081/admin/count-worker`),
          axios.get(`http://localhost:8081/admin/count-male-clients`),
          axios.get(`http://localhost:8081/admin/count-female-clients`),
          axios.get(`http://localhost:8081/admin/recent-clients`),
          axios.get(`http://localhost:8081/admin/new-registered`),
          axios.get(`http://localhost:8081/admin/category-count`),
          axios.get(`http://localhost:8081/admin/age-segmentation`),
          axios.get(`http://localhost:8081/admin/updates-line-graph`), // Fetch updates data
          axios.get(`http://localhost:8081/admin/count-medicines`), // Fetch medicine count
        ]);

        // Log all responses for debugging
        console.log("Total Clients Response:", totalClientsRes.data);
        console.log("Total Workers Response:", totalWorkerRes.data);
        console.log("Male Clients Response:", maleClientsRes.data);
        console.log("Female Clients Response:", femaleClientsRes.data);
        console.log("Recent Clients Response:", recentClientsRes.data);
        console.log("New Registered Response:", newRegisteredRes.data);
        console.log("Category Count Response:", categoryCountRes.data);
        console.log("Age Segmentation Response:", ageSegmentationRes.data);
        console.log("Updates Response:", updatesRes.data);
        console.log("Medicine Count Response:", medicineCountRes.data);

        /**
         * Set Count Data
         */
        setCountData([
          {
            label: "Total Workers",
            value: totalWorkerRes.data.totalWorkers, // Ensure this matches backend
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

        // Set Medicine Count separately if needed elsewhere
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

        // Data fetching complete
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  /**
   * Prepare Data for Line Charts
   */

  // Line Graph 1: New Registrations Over Time
  const linegraph1 = [
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

  // Line Graph 2: Updates Over Time
  const linegraph2 = [
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
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {/* Age Segmentation */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white md:col-span-2">
          <h1 className="text-xl font-bold">Age Segmentation</h1>
          <ColumnChart data={ageSegmentationData} height={350} />
        </div>

        {/* Recent Clients */}
        <div className="p-5 rounded-xl shadow-md shadow-gray-50 border border-[#e5e7e7] bg-white">
          <h1 className="text-xl font-bold mb-3 pl-2">Recent Clients</h1>
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
          <AdminTaskPieChart taskData={taskData} taskLabels={taskLabels} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
