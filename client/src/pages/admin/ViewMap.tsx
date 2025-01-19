// ViewMap.tsx

import React, { useRef, useState, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import "@arcgis/core/assets/esri/themes/light/main.css";
import axios from "axios";
import { Select, SelectItem } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";

/* ------------------------ Interfaces ------------------------ */
interface ClientData {
  id: number;
  category_name: string;
  full_name: string;
  latitude: number;
  longitude: number;
  worker_id: number;
}

interface HighRiskPlaceAssign {
  place_assign: string;
  category_name: string;
  category_count: number;
  worker_id: number;
  worker_name: string;
}

interface PurokCount {
  purok: string;
  client_count: number;
}


/* ------------------------ Constants ------------------------- */
const TOTAL_POPULATION = 7621;

// Marker colors (optional)
const categoryColors: Record<string, [number, number, number]> = {
  Pregnant: [255, 0, 0],
  "Schistomiasis Program Services": [255, 165, 0],
  "Hypertensive And Type 2 Diabetes": [128, 0, 0],
  "Filariasis Program Services": [0, 128, 0],
  "Current Smokers": [0, 0, 128],
};

/**
 * 5 categories that have high-risk data (and thus a risk table).
 * If a user selects anything else, the High-Risk panel won't appear at all.
 */
const riskReferenceMap: Record<
  string,
  { low: number; medium: number; high: number }
> = {
  Pregnant: { low: 10, medium: 30, high: 60 },
  "Schistomiasis Program Services": { low: 15, medium: 25, high: 60 },
  "Hypertensive And Type 2 Diabetes": { low: 10, medium: 20, high: 70 },
  "Filariasis Program Services": { low: 5, medium: 20, high: 75 },
  "Current Smokers": { low: 5, medium: 25, high: 70 },
};

const ViewMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);

  // State
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [highRiskInfo, setHighRiskInfo] = useState<HighRiskPlaceAssign[]>([]);
  const [loadingHighRisk, setLoadingHighRisk] = useState<boolean>(false);
  const [purokCounts, setPurokCounts] = useState<PurokCount[]>([]);
  const [loadingPurokCounts, setLoadingPurokCounts] = useState<boolean>(false);

  // If you still need placeAssignCoordinates (optional):

  /* ------------------- 1) Fetch Data on Mount ------------------- */
  useEffect(() => {
    // Fetch active clients
    axios
      .get("https://health-center-repo-production.up.railway.app/clients-admin-map")
      .then((response) => {
        setClients(response.data);
        console.log("Clients Data:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching client data:", error);
      });

  }, []);

  /* ----------------- 2) Initialize & Update Map ----------------- */
  useEffect(() => {
    if (mapRef.current && !viewRef.current) {
      const map = new Map({ basemap: "osm-3d" });
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [125.422942, 7.1948628],
        zoom: 12,
      });
      viewRef.current = view;
      console.log("Map initialized.");
    }

    if (viewRef.current) {
      // Safely remove old markers
      viewRef.current.graphics.removeAll();

      // Filter clients by category
      const filteredClients =
        selectedCategory === null
          ? clients
          : clients.filter((c) => c.category_name === selectedCategory);

      // Build an array of ArcGIS Graphic objects
      const graphicsArray = filteredClients
        .map((client) => {
          if (!client.latitude || !client.longitude) return null;
          return new Graphic({
            geometry: new Point({
              longitude: client.longitude,
              latitude: client.latitude,
            }),
            symbol: new SimpleMarkerSymbol({
              color: categoryColors[client.category_name] || [0, 0, 0],
              outline: { color: [255, 255, 255], width: 1 },
            }),
            attributes: { name: client.full_name },
            popupTemplate: {
              title: "{name}",
              content: `Category: ${client.category_name}`,
            },
          });
        })
        .filter((g) => g !== null) as Graphic[];

      // Add all ArcGIS Graphics at once
      viewRef.current.graphics.addMany(graphicsArray);
    }

    // Cleanup on unmount
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [clients, selectedCategory]);

  /* ------------------ 3) Fetch High-Risk Data ------------------- */
  useEffect(() => {
    if (selectedCategory !== null) {
      setLoadingHighRisk(true);
      axios
        .get("https://health-center-repo-production.up.railway.app/clients-admin-map-high-risk", {
          params: { category_name: selectedCategory },
        })
        .then((response) => {
          setHighRiskInfo(response.data);
          console.log("High-Risk Data:", response.data);
          setLoadingHighRisk(false);
        })
        .catch((error) => {
          console.error("Error fetching high-risk areas:", error);
          setLoadingHighRisk(false);
        });
    } else {
      setHighRiskInfo([]);
    }
  }, [selectedCategory]);

  /* ----------------- 4) Fetch Purok Counts ------------------- */
  useEffect(() => {
    setLoadingPurokCounts(true);
    axios
      .get("https://health-center-repo-production.up.railway.app/clients-admin-map-purok-counts", {
        params: { category_name: selectedCategory },
      })
      .then((response) => {
        setPurokCounts(response.data);
        console.log("Purok Counts Data:", response.data);
        setLoadingPurokCounts(false);
      })
      .catch((error) => {
        console.error("Error fetching purok counts:", error);
        setLoadingPurokCounts(false);
      });
  }, [selectedCategory]);

  /* ---------------------- 5) Dropdown Handler ---------------------- */
  const handleCategoryChange = (value: string) => {
    const category = value === "view-all" ? null : value;
    setSelectedCategory(category);
  };

  /* ---------------------- 6) Stats for Display ---------------------- */
  const displayedClients =
    selectedCategory === null
      ? clients
      : clients.filter((c) => c.category_name === selectedCategory);

  const categoryCount = displayedClients.length;
  const categoryPercentage = (categoryCount / TOTAL_POPULATION) * 100;

  /* ---------------- 7) Risk Distribution Table ---------------- */
  // True if the selectedCategory is one of the five "risk" categories
  const isHighRiskCategory =
    selectedCategory && riskReferenceMap[selectedCategory] !== undefined;

  // Build the risk table if isHighRiskCategory is true
  let riskTable = null;
  if (isHighRiskCategory && selectedCategory) {
    const { low, medium, high } = riskReferenceMap[selectedCategory];
    riskTable = (
      <div className="mt-5 p-4 border border-gray-300 rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">
          Risk Distribution for {selectedCategory}
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border border-gray-300" />
                <th
                  className="px-2 py-1 border border-gray-300 text-green-600"
                >
                  Low
                </th>
                <th
                  className="px-2 py-1 border border-gray-300 text-orange-500"
                >
                  Medium
                </th>
                <th
                  className="px-2 py-1 border border-gray-300 text-red-600"
                >
                  High
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1 border border-gray-300 font-semibold">
                  Percent
                </td>
                <td className="px-2 py-1 border border-gray-300">{low}%</td>
                <td className="px-2 py-1 border border-gray-300">{medium}%</td>
                <td className="px-2 py-1 border border-gray-300">{high}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ---------------- 8) Purok-wise Statistics Table ---------------- */
  const purokTable = (
    <div className="mt-5 p-4 border border-gray-300 rounded bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Purok-wise Client Distribution</h2>
      {loadingPurokCounts ? (
        <p>Loading purok-wise data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border border-gray-300">Purok</th>
                <th className="px-2 py-1 border border-gray-300">Client Count</th>
                <th className="px-2 py-1 border border-gray-300">Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {purokCounts.map((purok, index) => (
                <tr key={index}>
                  <td className="px-2 py-1 border border-gray-300">{purok.purok}</td>
                  <td className="px-2 py-1 border border-gray-300">{purok.client_count}</td>
                  <td className="px-2 py-1 border border-gray-300">
                    {((purok.client_count / TOTAL_POPULATION) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ------------------------ Render ------------------------ */
  return (
    <div className="flex flex-col items-start p-3">
      <Link to="/list" className="text-lg text-green-500 flex items-center mb-3">
        <FaAngleLeft size={20} />
        Back
      </Link>

      <div className="flex flex-col lg:flex-row w-full mb-5 space-y-5 lg:space-y-0 lg:space-x-5">
        {/* Left Pane */}
        <div className="flex flex-col lg:w-1/4 md:w-1/3 w-full">
          <h1 className="text-3xl font-bold mb-3">Filter Map</h1>

          {/* -------------- Manual Select -------------- */}
          <Select
            size="lg"
            label="Select Category"
            className="w-full"
            onChange={(e) => handleCategoryChange(e.target.value)}
            placeholder="Select a category"
          >
            <SelectItem key="view-all" value="view-all">
              View All
            </SelectItem>
            <SelectItem key="Pregnant" value="Pregnant">
              Pregnant
            </SelectItem>
            <SelectItem
              key="Person With Disabilities"
              value="Person With Disabilities"
            >
              Person With Disabilities
            </SelectItem>
            <SelectItem
              key="10-19 Years Old (Adolescents)"
              value="10-19 Years Old (Adolescents)"
            >
              10-19 Years Old (Adolescents)
            </SelectItem>
            <SelectItem
              key="Schistomiasis Program Services"
              value="Schistomiasis Program Services"
            >
              Schistomiasis Program Services
            </SelectItem>
            <SelectItem key="Senior Citizen" value="Senior Citizen">
              Senior Citizen
            </SelectItem>
            <SelectItem key="Family Planning" value="Family Planning">
              Family Planning
            </SelectItem>
            <SelectItem
              key="Hypertensive And Type 2 Diabetes"
              value="Hypertensive And Type 2 Diabetes"
            >
              Hypertensive And Type 2 Diabetes
            </SelectItem>
            <SelectItem
              key="Filariasis Program Services"
              value="Filariasis Program Services"
            >
              Filariasis Program Services
            </SelectItem>
            <SelectItem key="Current Smokers" value="Current Smokers">
              Current Smokers
            </SelectItem>
            <SelectItem
              key="0-11 Months Old Infants"
              value="0-11 Months Old Infants"
            >
              0-11 Months Old Infants
            </SelectItem>
            <SelectItem
              key="0-59 Months Old Children"
              value="0-59 Months Old Children"
            >
              0-59 Months Old Children
            </SelectItem>
            <SelectItem
              key="5-9 Years Old Children"
              value="5-9 Years Old Children"
            >
              5-9 Years Old Children
            </SelectItem>
            <SelectItem
              key="10-19 Years Old (Adolescents)"
              value="10-19 Years Old (Adolescents)"
            >
              10-19 Years Old (Adolescents)
            </SelectItem>
          </Select>
          {/* -------------- End Manual Select -------------- */}

          {/* Category Stats */}
          <div className="mt-5">
            <h2 className="text-2xl font-semibold mb-2">Category Statistics</h2>
            {selectedCategory === null ? (
              <p>
                Displaying all categories: <strong>{categoryCount}</strong> clients
                <br />
                That’s {categoryPercentage.toFixed(2)}% of{" "}
                {TOTAL_POPULATION.toLocaleString()} total population.
              </p>
            ) : (
              <p>
                Category: <strong>{selectedCategory}</strong>
                <br />
                Count: {categoryCount}
                <br />
                Percentage of total population: {categoryPercentage.toFixed(2)}%
              </p>
            )}
          </div>

          {/* High-Risk Panel — Only show if 'isHighRiskCategory' is true */}
          {isHighRiskCategory && (
            <div className="mt-5">
              <h2 className="text-2xl font-semibold mb-2">High-Risk Areas</h2>
              {loadingHighRisk && (
                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                  <p>Loading high-risk areas...</p>
                </div>
              )}
              {!loadingHighRisk && highRiskInfo.length > 0 && (
                <div className="p-4 bg-red-100 border border-red-400 rounded">
                  <ul className="list-disc list-inside">
                    {highRiskInfo.map((area, index) => (
                      <li key={index}>
                        <strong>Place Assign:</strong> {area.place_assign}
                        <br />
                        <strong>Category:</strong> {area.category_name}
                        <br />
                        <strong>Count:</strong> {area.category_count}
                        <br />
                        <strong>Worker:</strong> {area.worker_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!loadingHighRisk && highRiskInfo.length === 0 && (
                <div className="p-4 bg-green-100 border border-green-400 rounded">
                  <p>No high-risk areas detected for the selected category.</p>
                </div>
              )}
            </div>
          )}

          {/* Risk Distribution Table (only for 5 categories) */}
          {riskTable}

          {/* Purok-wise Statistics Table */}
          {purokTable}
        </div>

        {/* Map Container */}
        <div className="flex-grow">
          <div
            ref={mapRef}
            className="h-96 md:h-[650px] w-full rounded-xl overflow-hidden shadow-lg border border-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewMap;
