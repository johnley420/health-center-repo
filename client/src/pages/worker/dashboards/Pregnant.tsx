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
          axios.get(`https://https://health-center-repo-production.up.railway.app/pregnant/count-total-clients`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/pregnant/age-segmentation`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/pregnant/new-registered`, {
            params: { worker_id: workerId, category_name: "Pregnant" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/pregnant/pregnant-data`, {
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

  const handlePrint = async () => {
    try {
      const workerId = sessionStorage.getItem("id");

      if (!workerId) {
        alert("Worker ID not found. Please log in again.");
        return;
      }

      // Make a request to the backend to generate the PDF
      const response = await axios.get(`https://https://health-center-repo-production.up.railway.app/print/pregnant`, {
        params: { worker_id: workerId },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Pregnant_Report.pdf';
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
      
      <PregnantCategoryDashboard
        countData={countData}
        ageSegmentationData={ageSegmentationData}
        newRegisteredData={newRegisteredData}
        updatesData={updatesData}
      />
       {/* Add a Download PDF Button */}
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

export default Pregnant;
