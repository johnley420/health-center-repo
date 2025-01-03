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
          axios.get(`health-center-repo-production.up.railway.app/person-with-disabilities/count-total-clients`, {
            params: { worker_id: workerId, category_name: "Person With Disabilities" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/person-with-disabilities/age-segmentation`, {
            params: { worker_id: workerId, category_name: "Person With Disabilities" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/person-with-disabilities/new-registered`, {
            params: { worker_id: workerId, category_name: "Person With Disabilities" },
          }),
          axios.get(`health-center-repo-production.up.railway.app/person-with-disabilities/person-with-disabilities-data`, {
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

  const handlePrint = async () => {
    try {
      const workerId = sessionStorage.getItem("id");

      if (!workerId) {
        alert("Worker ID not found. Please log in again.");
        return;
      }

      // Make a request to the backend to generate the PDF
      const response = await axios.get(`health-center-repo-production.up.railway.app/print/personwithdisability`, {
        params: { worker_id: workerId },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'PersonWithDisability_Report.pdf';
      link.click();

      // Clean up
      window.URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again later.");
    }
  };

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
    <>
      <PersonWithDisabilityCategoryDashboard
          countData={countData}
          ageSegmentationData={ageSegmentationData}
          newRegisteredData={newRegisteredData}
          updatesData={updatesData} />
      <div className="flex justify-end mt-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download  Report
        </button>
      </div>
    </>
    
  );
};

export default PersonWithDisability;
