// src/pages/admin/dashboards/Pregnant.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import PregnantCategoryDashboard from "../../../components/dashboard/PregnantCategoryDashboard";

/**
 * Type Definitions
 */

// Interface for count data displayed in CountCard
interface CountData {
  label: string;
  value: number;
  description: string;
  active: boolean;
  withVariant?: {
    female: number;
  };
}

// Interface for age segmentation data
interface AgeSegmentation {
  age_range: string;
  count: number;
}

// Interface for new registered entries
interface NewRegisteredEntry {
  day: string;
  count: number;
}

// Interface for updates data
interface UpdatesData {
  date: string;
  client_count: number;
}

// Props for CategoryDashboard

const Pregnant: React.FC = () => {
  const [countData, setCountData] = useState<CountData[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State Variables
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerId = sessionStorage.getItem("id");

        if (!workerId) {
          setError("Worker ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch all necessary data concurrently
        const [
          totalResponse,
          ageSegmentationResponse,
          newRegisteredResponse,
          updatesResponse,
        ] = await Promise.all([
          axios.get(`https://health-center-repo-production.up.railway.app/admin/pregnant/count-total-clients`, {
            params: { category_name: "Pregnant", month: selectedMonth, year: selectedYear },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/pregnant/age-segmentation`, {
            params: { category_name: "Pregnant", month: selectedMonth, year: selectedYear },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/pregnant/new-registered`, {
            params: { worker_id: workerId, category_name: "Pregnant", month: selectedMonth, year: selectedYear },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/pregnant/pregnant-data`, {
            params: { month: selectedMonth, year: selectedYear },
          }),
        ]);

        // Calculate total clients
        const totalClients = totalResponse.data.reduce(
          (acc: number, curr: any) => acc + curr.totalClients,
          0
        );

        // Find female clients
        const femaleClients = totalResponse.data.find((item: any) => item.gender === "female")?.totalClients || 0;

        setCountData([
          {
            label: "Total Clients",
            value: totalClients,
            description: "Total number of pregnant female clients.",
            active: true,
            withVariant: {
              female: femaleClients,
            },
          },
        ]);

        // Set age segmentation data
        setAgeSegmentationData(ageSegmentationResponse.data);

        // Set new registered clients
        setNewRegisteredData(newRegisteredResponse.data);

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
  }, [selectedMonth, selectedYear]);

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

      <PregnantCategoryDashboard
        countData={countData}
        ageSegmentationData={ageSegmentationData}
        newRegisteredData={newRegisteredData}
        updatesData={updatesData}
      />
    </div>
  );
};

export default Pregnant;
