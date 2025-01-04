// src/pages/admin/dashboards/YearsScreened059ProgramService.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import YearsScreened059CategoryDashboard from "../../../components/dashboard/YearsScreened059CategoryDashboard";

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

// Props for YearsScreened059CategoryDashboard


const YearsScreened059: React.FC = () => {
  const [countData, setCountData] = useState<CountData[]>([]);
  const [ageSegmentationData, setAgeSegmentationData] = useState<AgeSegmentation[]>([]);
  const [newRegisteredData, setNewRegisteredData] = useState<NewRegisteredEntry[]>([]);
  const [updatesData, setUpdatesData] = useState<UpdatesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false); // New state for download status

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
          axios.get(`https://https://health-center-repo-production.up.railway.app/screened059/count-total-clients`, {
            params: { worker_id: workerId, category_name: "0-59 Years Old Screened For Visual Activity" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/screened059/age-segmentation`, {
            params: { worker_id: workerId, category_name: "0-59 Years Old Screened For Visual Activity" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/screened059/new-registered`, {
            params: { worker_id: workerId, category_name: "0-59 Years Old Screened For Visual Activity" },
          }),
          axios.get(`https://https://health-center-repo-production.up.railway.app/screened059/screened059-data`, {
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
            description: "Total number of clients in 0-59 Years Old Screened For Visual Activity Program Services.",
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

  /**
   * Function to handle PDF download
   */
  const downloadPDF = async () => {
    try {
      const workerId = sessionStorage.getItem("id");
      if (!workerId) {
        alert("Worker ID not found. Please log in again.");
        return;
      }

      setDownloading(true); // Start downloading

      const response = await axios.get('https://https://health-center-repo-production.up.railway.app/print/screened059', {
        params: { worker_id: workerId },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Screened059_Report.pdf');
      document.body.appendChild(link);
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloading(false); // End downloading
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again later.");
      setDownloading(false); // End downloading even if there's an error
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
    <div className="p-4">
      <YearsScreened059CategoryDashboard
        countData={countData}
        ageSegmentationData={ageSegmentationData}
        newRegisteredData={newRegisteredData}
        updatesData={updatesData}
      />

      {/* Add a Download PDF Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={downloadPDF}
          className={`px-4 py-2 rounded text-white ${
            downloading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download Screened059 Report'}
        </button>
      </div>
    </div>
  );
};

export default YearsScreened059;
