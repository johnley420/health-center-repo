import React, { useRef, useState, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import "@arcgis/core/assets/esri/themes/light/main.css";
import axios from "axios";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import { Button } from "@nextui-org/react";
import Swal from "sweetalert2";

interface ClientData {
  id: number;
  category_id: number;
  full_name: string;
  latitude: string;
  longitude: string;
}

const categoryColors: Record<number, [number, number, number]> = {
  1: [255, 0, 0],
  2: [0, 255, 0],
  3: [0, 0, 255],
  // Add other categories if needed
};

const ViewMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { clientId, latitude, longitude } = state as {
    clientId: number;
    latitude: string;
    longitude: string;
  };

  const workerId = sessionStorage.getItem("id");

  useEffect(() => {
    axios
      .get(`health-center-repo-production.up.railway.app/clients-map?workerId=${workerId}&id=${clientId}`)
      .then((response) => {
        setClient(response.data[0]); // Assuming response.data is an array and you need the first item
      })
      .catch((error) => {
        console.error("Error fetching client data:", error);
      });
  }, [clientId, workerId]);

  useEffect(() => {
    if (mapRef.current && !viewRef.current) {
      const map = new Map({ basemap: "osm-3d" });
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [parseFloat(longitude), parseFloat(latitude)], // Set initial center to client's location
        zoom: 12,
      });

      view.on("click", (event) => {
        const point = view.toMap({ x: event.x, y: event.y });
        if (client) {
          setClient((prevClient) => ({
            ...prevClient!,
            latitude: point.latitude.toString(),
            longitude: point.longitude.toString(),
          }));

          view.graphics.removeAll();
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              color: categoryColors[client.category_id] || [0, 0, 0],
              outline: {
                color: [255, 255, 255],
                width: 1,
              },
            }),
          });
          view.graphics.add(pointGraphic);
        }
      });

      viewRef.current = view;
    }

    if (viewRef.current && client) {
      const pointGraphic = new Graphic({
        geometry: new Point({
          longitude: parseFloat(client.longitude),
          latitude: parseFloat(client.latitude),
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
      viewRef.current.graphics.add(pointGraphic);
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [client, latitude, longitude]);

  const handleSave = () => {
  if (client) {
    axios
      .put(`health-center-repo-production.up.railway.app/update-client/${client.id}`, {
        latitude: client.latitude,
        longitude: client.longitude,
      })
      .then(() => { // Removed 'response' parameter
        Swal.fire({
          title: "Success",
          text: "Position updated successfully!",
          icon: "success",
        }).then(() => {
          navigate("/client-list"); // Redirect after successful update
        });
      })
      .catch((error) => {
        console.error("Error updating client:", error);
        Swal.fire("Error", "An error occurred while updating the client", "error");
      });
  }
};


  return (
    <div className="flex flex-col items-start p-3">
      <Link
        to="/client-list"
        className="text-lg text-green-500 flex items-center mb-3"
      >
        <FaAngleLeft size={20} />
        Back
      </Link>
      <div className="flex items-center justify-between w-full mb-5">
        <h1 className="text-3xl font-bold pl-3">Client Address</h1>
        <Button color="primary" size="lg" onClick={handleSave}>
          Save
        </Button>
      </div>
      <div
        ref={mapRef}
        className="h-[650px] w-full rounded-xl overflow-hidden shadow-lg border border-green-500"
      ></div>
    </div>
  );
};

export default ViewMap;
