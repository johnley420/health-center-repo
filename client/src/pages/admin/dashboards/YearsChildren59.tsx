// src/pages/admin/dashboards/YearsChildren5to9ProgramService.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import YearsChildren5to9CategoryDashboard from "../../../components/dashboard/YearsChildren5to9CategoryDashboard";

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

const yearsChildren5to9: React.FC = () => {
  const [countData, setCountData] = useState<CountData[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          axios.get(`https://health-center-repo-production.up.railway.app/admin/children5to9/count-total-clients`, {
            params: {  category_name: "5-9 Years Old Children (School Aged Children)" },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/children5to9/age-segmentation`, {
            params: { category_name: "5-9 Years Old Children (School Aged Children)" },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/children5to9/new-registered`, {
            params: {category_name: "5-9 Years Old Children (School Aged Children)" },
          }),
          axios.get(`https://health-center-repo-production.up.railway.app/admin/children5to9/children5to9-data`, {
            params: { worker_id: workerId },
          }),
        ]);

        // Process total clients data
        const totalClients = totalResponse.data.reduce(
          (acc: number, curr: any) => acc + curr.totalClients,
          0
        );

        const maleClients = totalResponse.data.find((item: any) => item.gender === "male")?.totalClients || 0;
        const femaleClients = totalResponse.data.find((item: any) => item.gender === "female")?.totalClients || 0;

        setCountData([
          {
            label: "Total Clients",
            value: totalClients,
            description: "Total number of clients in 5-9 Years Old Children (School Aged Children) Program Services.",
            active: true,
            withVariants: {
              male: maleClients,
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
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "Failed to load dashboard data.");
        } else {
          setError("An unexpected error occurred.");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <YearsChildren5to9CategoryDashboard
      countData={countData}
      ageSegmentationData={ageSegmentationData}
      newRegisteredData={newRegisteredData}
      updatesData={updatesData}
    />
  );
};

export default yearsChildren5to9;
