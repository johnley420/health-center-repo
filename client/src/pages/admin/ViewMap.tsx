import React, { useRef, useState, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import "@arcgis/core/assets/esri/themes/light/main.css";
import axios from "axios";
import { Select, SelectItem } from "@nextui-org/react";

interface ClientData {
  id: number;
  category_id: number;
  full_name: string;
  latitude: number;
  longitude: number;
}

const categoryColors: Record<number, [number, number, number]> = {
  1: [255, 0, 0],
  2: [0, 255, 0],
  3: [0, 0, 255],
  4: [255, 255, 0],
  5: [255, 0, 255],
  6: [0, 255, 255],
  7: [128, 0, 0],
  8: [0, 128, 0],
  9: [0, 0, 128],
  10: [128, 128, 0],
  11: [128, 0, 128],
  12: [0, 128, 128],
  13: [192, 192, 192],
};

const ViewMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedView, setSelectedView] = useState<string>("view-all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  console.log("trt", selectedView);

  useEffect(() => {
    axios
      .get("http://localhost:8081/clients")
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching client data:", error);
      });
  }, []);

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
    }

    if (viewRef.current) {
      viewRef.current.graphics.removeAll();
      clients.forEach((client) => {
        if (
          selectedCategory === null ||
          client.category_id === selectedCategory
        ) {
          if (client.latitude && client.longitude) {
            const pointGraphic = new Graphic({
              geometry: new Point({
                longitude: client.longitude,
                latitude: client.latitude,
              }),
              symbol: new SimpleMarkerSymbol({
                color: categoryColors[client.category_id] || [0, 0, 0],
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              }),
              attributes: {
                name: client.full_name,
              },
            });
            viewRef.current?.graphics.add(pointGraphic);
          }
        }
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [clients, selectedCategory, selectedView]);

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedView(event.target.value);
    setSelectedCategory(null);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const category = parseInt(event.target.value);
    setSelectedCategory(category);
  };

  return (
    <div className="flex flex-col items-start p-3">
      <div className="flex items-center justify-between w-full mb-5">
        <h1 className="text-3xl font-bold pl-3">Client Address</h1>

        <div className="flex text-center  gap-5">
          <Select
            size="lg"
            label="Filter Map"
            className="w-[250px]"
            onChange={handleDropdownChange}
          >
            <SelectItem key={"view-all"}>View All</SelectItem>
            <SelectItem key={"specific-category"}>
              Specific View of Category
            </SelectItem>
          </Select>

          {selectedView === "specific-category" && (
            <Select
              size="lg"
              label="Select a Category"
              className="w-[250px]"
              onChange={handleCategoryChange}
            >
              {Object.keys(categoryColors).map((categoryId) => (
                <SelectItem key={categoryId}>Category {categoryId}</SelectItem>
              ))}
            </Select>
          )}
        </div>
      </div>
      <div
        ref={mapRef}
        className="h-[650px] w-full rounded-xl overflow-hidden shadow-lg border border-green-500"
      ></div>
    </div>
  );
};

export default ViewMap;
