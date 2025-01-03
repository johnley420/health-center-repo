// src/pages/admin/dashboards/Pregnant.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import PregnantCategoryDashboard from "../../components/dashboard/PregnantCategoryDashboard";

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
          axios.get(`health-center-repo-production.up.railway.app/pregnant/count-total-clients`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/pregnant/age-segmentation`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/pregnant/new-registered`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/pregnant/pregnant-data`, {
            params: { worker_id: workerId },
          }),
        ]);

        const totalClients = totalResponse.data.reduce(
          (acc: number, curr: any) => acc + curr.totalClients,
          0
        );
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
    <PregnantCategoryDashboard
      countData={countData}
      ageSegmentationData={ageSegmentationData}
      newRegisteredData={newRegisteredData}
      updatesData={updatesData}
    />
  );
};

export default Pregnant;
