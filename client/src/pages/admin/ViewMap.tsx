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

interface PlaceAssignCoordinate {
  place_assign: string;
  longitude: number;
  latitude: number;
}

const categoryColors: Record<string, [number, number, number]> = {
  "Pregnant": [255, 0, 0],
  "Person With Disabilities": [0, 255, 0],
  "10-19 Years Old (Adolescents)": [0, 0, 255],
  "Schistomiasis Program Services": [255, 255, 0],
  "Senior Citizen": [255, 0, 255],
  "Family Planning": [0, 255, 255],
  "Hypertensive And Type 2 Diabetes": [128, 0, 0],
  "Filariasis Program Services": [0, 128, 0],
  "Current Smokers": [0, 0, 128],
  "0-11 Months Old Infants": [128, 128, 0],
  "0-59 Months Old Children": [128, 0, 128],
  "5-9 Years Old Children": [0, 128, 128], // Duplicate category name to handle multiple entries
};

// Initial mapping is empty; coordinates will be fetched dynamically
const initialPlaceAssignCoordinates: Record<string, [number, number]> = {};

const ViewMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [highRiskInfo, setHighRiskInfo] = useState<HighRiskPlaceAssign[]>([]);
  const [placeAssignCoordinates, setPlaceAssignCoordinates] = useState<Record<string, [number, number]>>(initialPlaceAssignCoordinates);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingHighRisk, setLoadingHighRisk] = useState<boolean>(false);

  useEffect(() => {
    // Fetch client data from the backend (only active clients)
    axios.get("https://health-center-repo-production.up.railway.app/clients-admin-map")
      .then((response) => {
        setClients(response.data);
        console.log("Clients Data:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching client data:", error);
      });

    // Fetch place_assign coordinates
    axios.get("https://health-center-repo-production.up.railway.app/place-assign-coordinates")
      .then((response) => {
        const coordinates: Record<string, [number, number]> = {};
        response.data.forEach((item: PlaceAssignCoordinate) => {
          coordinates[item.place_assign] = [item.longitude, item.latitude];
        });
        setPlaceAssignCoordinates(coordinates);
        console.log("Place Assign Coordinates:", coordinates);
      })
      .catch((error) => {
        console.error("Error fetching place_assign coordinates:", error);
      });
  }, []);

  useEffect(() => {
    // Initialize map and view if not already created
    if (mapRef.current && !viewRef.current) {
      const map = new Map({ basemap: "osm-3d" });
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [125.422942, 7.1948628], // Adjust as needed
        zoom: 12,
      });
      viewRef.current = view;
      console.log("Map initialized.");
    }

    if (viewRef.current) {
      viewRef.current.graphics.removeAll(); // Clear previous graphics
      console.log("Cleared previous graphics.");

      // Add client markers
      clients.forEach((client) => {
        if (selectedCategory === null || client.category_name === selectedCategory) {
          if (client.latitude && client.longitude) {
            const pointGraphic = new Graphic({
              geometry: new Point({
                longitude: client.longitude,
                latitude: client.latitude,
              }),
              symbol: new SimpleMarkerSymbol({
                color: categoryColors[client.category_name] || [0, 0, 0],
                outline: { color: [255, 255, 255], width: 1 },
              }),
              attributes: { name: client.full_name },
              popupTemplate: { // Optional: Add popups
                title: "{name}",
                content: `Category: ${client.category_name}`,
              },
            });
            viewRef.current?.graphics.add(pointGraphic);
            // Debugging
            console.log(`Added client marker for ${client.full_name} at (${client.longitude}, ${client.latitude})`);
          }
        }
      });

      // Note: High-risk markers are not added to the map
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
        console.log("Destroyed map view.");
      }
    };
  }, [clients, selectedCategory, placeAssignCoordinates]);

  // Fetch high-risk data based on selected category
  useEffect(() => {
    if (selectedCategory !== null) {
      setLoadingHighRisk(true);
      axios.get(`https://health-center-repo-production.up.railway.app/clients-admin-map-high-risk`, {
        params: {
          category_name: selectedCategory,
        },
      })
        .then((response) => {
          setHighRiskInfo(response.data);
          console.log("Filtered High-Risk Areas:", response.data);
          setLoadingHighRisk(false);
        })
        .catch((error) => {
          console.error("Error fetching high-risk areas:", error);
          setLoadingHighRisk(false);
        });
    } else {
      // If "View All" is selected, clear the high-risk info
      setHighRiskInfo([]);
      console.log("No category selected. Cleared high-risk info.");
    }
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    const category = value === "view-all" ? null : value;
    setSelectedCategory(category);
    console.log(`Selected Category: ${category}`);
  };

  return (
    <div className="flex flex-col items-start p-3">
      <Link to="/list" className="text-lg text-green-500 flex items-center mb-3">
        <FaAngleLeft size={20} /> Back
      </Link>
      <div className="flex w-full mb-5">
        <div className="flex flex-col w-1/4 mr-5">
          <h1 className="text-3xl font-bold mb-3">Filter Map</h1>
          <Select 
            size="lg" 
            label="Select Category" 
            className="w-full" 
            onChange={(e) => handleCategoryChange(e.target.value)}
            placeholder="Select a category"
          >
            <SelectItem key="view-all" value="view-all">View All</SelectItem>
            <SelectItem key="Pregnant" value="Pregnant">Pregnant</SelectItem>
            <SelectItem key="Person With Disabilities" value="Person With Disabilities">Person With Disabilities</SelectItem>
            <SelectItem key="10-19 Years Old (Adolescents)" value="10-19 Years Old (Adolescents)">10-19 Years Old (Adolescents)</SelectItem>
            <SelectItem key="Schistomiasis Program Services" value="Schistomiasis Program Services">Schistomiasis Program Services</SelectItem>
            <SelectItem key="Senior Citizen" value="Senior Citizen">Senior Citizen</SelectItem>
            <SelectItem key="Family Planning" value="Family Planning">Family Planning</SelectItem>
            <SelectItem key="Hypertensive And Type 2 Diabetes" value="Hypertensive And Type 2 Diabetes">Hypertensive And Type 2 Diabetes</SelectItem>
            <SelectItem key="Filariasis Program Services" value="Filariasis Program Services">Filariasis Program Services</SelectItem>
            <SelectItem key="Current Smokers" value="Current Smokers">Current Smokers</SelectItem>
            <SelectItem key="0-11 Months Old Infants" value="0-11 Months Old Infants">0-11 Months Old Infants</SelectItem>
            <SelectItem key="0-59 Months Old Children" value="0-59 Months Old Children">0-59 Months Old Children</SelectItem>
            <SelectItem key="5-9 Years Old Children" value="5-9 Years Old Children">5-9 Years Old Children</SelectItem>
            <SelectItem key="10-19 Years Old (Adolescents)" value="10-19 Years Old (Adolescents)">10-19 Years Old (Adolescents)</SelectItem>
          </Select>
          {/* High-Risk Information Panel */}
          <div className="mt-5">
            <h2 className="text-2xl font-semibold mb-2">High-Risk Areas</h2>
            {loadingHighRisk && (
              <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p>Loading high-risk areas...</p>
              </div>
            )}
            {!loadingHighRisk && selectedCategory !== null && highRiskInfo.length > 0 && (
              <div className="p-4 bg-red-100 border border-red-400 rounded">
                <ul className="list-disc list-inside">
                  {highRiskInfo.map((area, index) => (
                    <li key={index}>
                      <strong>Place Assign:</strong> {area.place_assign}<br />
                      <strong>Category:</strong> {area.category_name}<br />
                      <strong>Count:</strong> {area.category_count}<br />
                      <strong>Worker:</strong> {area.worker_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!loadingHighRisk && selectedCategory !== null && highRiskInfo.length === 0 && (
              <div className="p-4 bg-green-100 border border-green-400 rounded">
                <p>No high-risk areas detected for the selected category.</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <div ref={mapRef} className="h-[650px] w-full rounded-xl overflow-hidden shadow-lg border border-green-500"></div>
        </div>
      </div>
    </div>
  );
};

export default ViewMap;
