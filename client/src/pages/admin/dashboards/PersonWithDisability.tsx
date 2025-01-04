// src/pages/admin/dashboards/PersonWithDisability.tsx

import React, { useState, useEffect } from "react";
import PersonWithDisabilityCategoryDashboard from "../../../components/dashboard/PersonWithDisabilityCategoryDashboard";
import axios from "axios";

/**
 * Type Definitions
 */

// Reuse the same interfaces defined in the dashboard component
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

interface AgeSegmentation {
  age_range: string;
  gender: string;
  count: number;
}

interface NewRegisteredEntry {
  day: string;
  gender: string;
  count: number;
}

interface UpdatesData {
  date: string;
  client_count: number;
}

const PersonWithDisability: React.FC = () => {
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
          axios.get(`https://https://health-center-repo-production.up.railway.app/admin/person-with-disabilities/count-total-clients`, {
            params: { category_name: "Person With Disabilities" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/admin/person-with-disabilities/age-segmentation`, {
            params: {  category_name: "Person With Disabilities" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/admin/person-with-disabilities/new-registered`, {
            params: {  category_name: "Person With Disabilities" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/admin/person-with-disabilities/person-with-disabilities-data`, {
            params: { worker_id: workerId },
          }),
        ]);

        // Process total clients data
        const totalClientsData: CountData = {
          label: "Total Clients",
          value: totalResponse.data.reduce((acc: number, curr: any) => acc + curr.totalClients, 0),
          description: "Total number of clients with disabilities.",
          active: true,
          withVariants: {
            male: totalResponse.data.find((item: any) => item.gender === "male")?.totalClients || 0,
            female: totalResponse.data.find((item: any) => item.gender === "female")?.totalClients || 0,
          },
        };

        setCountData([totalClientsData]);

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
    <PersonWithDisabilityCategoryDashboard
      countData={countData}
      ageSegmentationData={ageSegmentationData}
      newRegisteredData={newRegisteredData}
      updatesData={updatesData}
    />
  );
};

export default PersonWithDisability;
