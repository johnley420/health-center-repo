// ViewMap.tsx

import React, { useRef, useState, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
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

interface PurokCount {
  purok: string;
  client_count: number;
}

/* ------------------------ Constants ------------------------- */
const TOTAL_POPULATION = 7621;

// Marker colors
const categoryColors: Record<string, [number, number, number]> = {
  Pregnant: [255, 0, 0],
  "Schistomiasis Program Services": [255, 165, 0],
  "Hypertensive And Type 2 Diabetes": [128, 0, 0],
  "Filariasis Program Services": [0, 128, 0],
  "Current Smokers": [0, 0, 128],
};

/**
 * Risk thresholds for each category.
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

/**
 * Mapping of purok keys (normalized) to center coordinates.
 */
const purokCoordinates: Record<string, { lat: number; lon: number }> = {
  purok1: { lat: 7.184687, lon: 125.421865 },
  purok2a: { lat: 7.189484, lon: 125.429046 },
  purok2b: { lat: 7.187365, lon: 125.424273 },
  purok3a1: { lat: 7.190170, lon: 125.434261 },
  purok3a2: { lat: 7.185844, lon: 125.435457 },
  purok3b: { lat: 7.193792, lon: 125.441987 },
  purok4a: { lat: 7.193098, lon: 125.410386 },
  purok4b: { lat: 7.188746, lon: 125.416939 },
  purok5: { lat: 7.183062, lon: 125.417355 },
  purok6: { lat: 7.180492, lon: 125.430114 },
};

/**
 * For demonstration, assume each purok has a total population of 100.
 */
const purokTotalPopulation: Record<string, number> = {
  purok1: 100,
  purok2a: 100,
  purok2b: 100,
  purok3a1: 100,
  purok3a2: 100,
  purok3b: 100,
  purok4a: 100,
  purok4b: 100,
  purok5: 100,
  purok6: 100,
};

/**
 * Helper function to compute Euclidean distance between two lat/lon points.
 */
const distanceBetween = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
};

const ViewMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  // Ref for storing the polygon border graphic
  const polygonGraphicRef = useRef<Graphic | null>(null);

  // State
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // New state for purok filter; default "view-all" shows all puroks.
  const [selectedPurok, setSelectedPurok] = useState<string>("view-all");
  const [purokCounts, setPurokCounts] = useState<PurokCount[]>([]);

  /* ------------------- 1) Fetch Data on Mount ------------------- */
  useEffect(() => {
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
    // Define polygon coordinates and close the ring.
    const polygonCoordinates = [
      [125.402943, 7.195587],
      [125.402818, 7.194207],
      [125.401788, 7.193867],
      [125.401475, 7.192813],
      [125.397446, 7.18959],
      [125.395291, 7.185066],
      [125.405232, 7.183736],
      [125.407903, 7.181859],
      [125.411449, 7.175594],
      [125.410419, 7.174251],
      [125.413275, 7.172287],
      [125.415711, 7.16834],
      [125.417462, 7.168094],
      [125.419042, 7.168699],
      [125.423992, 7.174629],
      [125.431663, 7.177311],
      [125.435908, 7.181674],
      [125.436403, 7.184035],
      [125.441619, 7.186037],
      [125.439201, 7.189455],
      [125.440896, 7.191967],
      [125.444263, 7.192913],
      [125.449954, 7.199578],
      [125.449457, 7.206891],
      [125.446004, 7.205595],
      [125.445973, 7.206151],
      [125.442894, 7.206444],
      [125.439488, 7.204083],
      [125.437047, 7.203019],
      [125.414986, 7.193245],
    ];
    polygonCoordinates.push(polygonCoordinates[0]);

    if (mapRef.current && !viewRef.current) {
      // Initialize the map
      const map = new Map({ basemap: "osm-3d" });
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [125.422942, 7.1948628],
        zoom: 12,
      });
      viewRef.current = view;
      console.log("Map initialized.");

      // ------------------ Add Polygon Border ------------------
      const polygon = new Polygon({
        rings: [polygonCoordinates],
        spatialReference: { wkid: 4326 },
      });
      const polygonSymbol = new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: new SimpleLineSymbol({
          color: "gray",
          style: "dash",
          width: 2,
        }),
      });
      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: polygonSymbol,
      });
      polygonGraphicRef.current = polygonGraphic;
      view.graphics.add(polygonGraphic);
      // ------------------ End Polygon Border ------------------

      // Set up click event for purok labels.
      view.on("click", async (event) => {
        const response = await view.hitTest(event);
        if (response.results.length > 0) {
          // Cast result to any so we can access .graphic
          const resultItem = response.results[0] as any;
          if (
            resultItem.graphic &&
            resultItem.graphic.attributes &&
            resultItem.graphic.attributes.purokKey
          ) {
            const purokKey: string = resultItem.graphic.attributes.purokKey;
            const entry = purokCounts.find(
              (e) => e.purok.toLowerCase().replace(/\s+/g, "") === purokKey
            );
            const totalPop = purokTotalPopulation[purokKey] || 100;
            let riskText = "No data";
            let riskPerc = 0;
            if (entry && selectedCategory && riskReferenceMap[selectedCategory]) {
              const thresholds = riskReferenceMap[selectedCategory];
              riskPerc = (entry.client_count / totalPop) * 100;
              if (riskPerc >= thresholds.high) {
                riskText = "High Risk";
              } else if (riskPerc >= thresholds.medium) {
                riskText = "Medium Risk";
              } else if (riskPerc >= thresholds.low) {
                riskText = "Low Risk";
              } else {
                riskText = "Very Low Risk";
              }
            }
            view.popup.open({
              title: `Risk Info for ${purokKey.toUpperCase()}`,
              content: `Risk Level: ${riskText} (${riskPerc.toFixed(
                2
              )}% of local population)`,
              location: event.mapPoint,
            });
            return;
          }
        }
      });
    }

    if (viewRef.current) {
      // Clear all graphics.
      viewRef.current.graphics.removeAll();

      // Re-add the polygon border.
      if (polygonGraphicRef.current) {
        viewRef.current.graphics.add(polygonGraphicRef.current);
      }

      // Filter clients by category.
      let filteredClients = clients;
      if (selectedCategory) {
        filteredClients = filteredClients.filter(
          (c) => c.category_name === selectedCategory
        );
      }
      // Filter by purok if one is selected (other than "view-all")
      if (selectedPurok !== "view-all") {
        const center = purokCoordinates[selectedPurok.toLowerCase()];
        if (center) {
          filteredClients = filteredClients.filter((c) => {
            return (
              distanceBetween(c.latitude, c.longitude, center.lat, center.lon) <
              0.005
            );
          });
        }
      }

      // Build client marker graphics.
      const markerGraphics = filteredClients
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

      viewRef.current.graphics.addMany(markerGraphics);

      // ------------------ Add Purok Label Graphics with Popup ------------------
      const labelPoints = [
        { lat: 7.184687, lon: 125.421865, label: "Purok 1" },
        { lat: 7.189484, lon: 125.429046, label: "Purok 2A" },
        { lat: 7.187365, lon: 125.424273, label: "Purok 2B" },
        { lat: 7.190170, lon: 125.434261, label: "Purok 3A1" },
        { lat: 7.185844, lon: 125.435457, label: "Purok 3A2" },
        { lat: 7.193792, lon: 125.441987, label: "Purok 3B" },
        { lat: 7.193098, lon: 125.410386, label: "Purok 4A" },
        { lat: 7.188746, lon: 125.416939, label: "Purok 4B" },
        { lat: 7.183062, lon: 125.417355, label: "Purok 5" },
        { lat: 7.180492, lon: 125.430114, label: "Purok 6" },
      ];

      const labelGraphics = labelPoints.map((pt) => {
        const key = pt.label.toLowerCase().replace(/\s+/g, "");
        return new Graphic({
          geometry: new Point({
            longitude: pt.lon,
            latitude: pt.lat,
          }),
          symbol: new TextSymbol({
            text: pt.label,
            color: "black",
            haloColor: "white",
            haloSize: "4px",
            font: {
              size: "14px",
              family: "sans-serif",
              weight: "bold",
            },
            horizontalAlignment: "center",
            verticalAlignment: "middle",
          }),
          attributes: { purokKey: key },
          popupTemplate: {
            title: "{purokKey}",
            content: (graphic: any) => {
              const purokKey = graphic.attributes.purokKey;
              const entry = purokCounts.find(
                (e) => e.purok.toLowerCase().replace(/\s+/g, "") === purokKey
              );
              const totalPop = purokTotalPopulation[purokKey] || 100;
              let riskText = "No data";
              let riskPerc = 0;
              if (entry && selectedCategory && riskReferenceMap[selectedCategory]) {
                const thresholds = riskReferenceMap[selectedCategory];
                riskPerc = (entry.client_count / totalPop) * 100;
                if (riskPerc >= thresholds.high) {
                  riskText = "High Risk";
                } else if (riskPerc >= thresholds.medium) {
                  riskText = "Medium Risk";
                } else if (riskPerc >= thresholds.low) {
                  riskText = "Low Risk";
                } else {
                  riskText = "Very Low Risk";
                }
                return `Risk Level: ${riskText} (${riskPerc.toFixed(2)}% of local population)`;
              }
              return `Risk Level: ${riskText}`;
            },
          },
        });
      });
      viewRef.current.graphics.addMany(labelGraphics);
      // ------------------ End Purok Label Graphics ------------------
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [clients, selectedCategory, purokCounts, selectedPurok]);

  /* ----------------- 4) Fetch Purok Counts ------------------- */
  useEffect(() => {
    axios
      .get("https://health-center-repo-production.up.railway.app/clients-admin-map-purok-counts", {
        params: { category_name: selectedCategory },
      })
      .then((response) => {
        setPurokCounts(response.data);
        console.log("Purok Counts Data:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching purok counts:", error);
      });
  }, [selectedCategory]);

  /* ---------------------- 5) Dropdown Handlers ---------------------- */
  const handleCategoryChange = (value: string) => {
    const category = value === "view-all" ? null : value;
    setSelectedCategory(category);
  };

  const handlePurokChange = (value: string) => {
    setSelectedPurok(value);
  };

  /* ---------------------- 6) Stats for Display ---------------------- */
  let filteredClients = clients;
  if (selectedCategory) {
    filteredClients = filteredClients.filter(
      (c) => c.category_name === selectedCategory
    );
  }
  if (selectedPurok !== "view-all") {
    const center = purokCoordinates[selectedPurok.toLowerCase()];
    if (center) {
      filteredClients = filteredClients.filter((c) =>
        distanceBetween(c.latitude, c.longitude, center.lat, center.lon) < 0.005
      );
    }
  }
  const categoryCount = filteredClients.length;
  const categoryPercentage = (categoryCount / TOTAL_POPULATION) * 100;

  /* ---------------- 7) Risk Distribution Table ---------------- */
  const isHighRiskCategory =
    selectedCategory && riskReferenceMap[selectedCategory] !== undefined;
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
                <th className="px-2 py-1 border border-gray-300 text-green-600">
                  Low
                </th>
                <th className="px-2 py-1 border border-gray-300 text-orange-500">
                  Medium
                </th>
                <th className="px-2 py-1 border border-gray-300 text-red-600">
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
      {purokCounts.length === 0 ? (
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
          {/* New Purok Dropdown */}
          <Select
            size="lg"
            label="Select Purok"
            className="w-full mb-4"
            value={selectedPurok}
            onChange={(e) => handlePurokChange(e.target.value)}
          >
            <SelectItem key="view-all" value="view-all">
              View All Puroks
            </SelectItem>
            <SelectItem key="purok1" value="purok1">
              Purok 1
            </SelectItem>
            <SelectItem key="purok2a" value="purok2a">
              Purok 2A
            </SelectItem>
            <SelectItem key="purok2b" value="purok2b">
              Purok 2B
            </SelectItem>
            <SelectItem key="purok3a1" value="purok3a1">
              Purok 3A1
            </SelectItem>
            <SelectItem key="purok3a2" value="purok3a2">
              Purok 3A2
            </SelectItem>
            <SelectItem key="purok3b" value="purok3b">
              Purok 3B
            </SelectItem>
            <SelectItem key="purok4a" value="purok4a">
              Purok 4A
            </SelectItem>
            <SelectItem key="purok4b" value="purok4b">
              Purok 4B
            </SelectItem>
            <SelectItem key="purok5" value="purok5">
              Purok 5
            </SelectItem>
            <SelectItem key="purok6" value="purok6">
              Purok 6
            </SelectItem>
          </Select>

          {/* Existing Category Dropdown */}
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

          {/* Category Stats */}
          <div className="mt-5">
            <h2 className="text-2xl font-semibold mb-2">Category Statistics</h2>
            {selectedCategory === null ? (
              <p>
                Displaying all categories: <strong>{filteredClients.length}</strong> clients
                <br />
                That’s {categoryPercentage.toFixed(2)}% of{" "}
                {TOTAL_POPULATION.toLocaleString()} total population.
              </p>
            ) : (
              <p>
                Category: <strong>{selectedCategory}</strong>
                <br />
                Count: {filteredClients.length}
                <br />
                Percentage of total population: {categoryPercentage.toFixed(2)}%
              </p>
            )}
          </div>

          {/* Risk Distribution Table */}
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
