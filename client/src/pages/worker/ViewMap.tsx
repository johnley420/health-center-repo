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
  // We'll use this ref to store our static (polygon & labels) graphics so they can be re‑added
  const staticGraphicsRef = useRef<Graphic[]>([]);

  const [client, setClient] = useState<ClientData | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clientId, latitude, longitude } = state as {
    clientId: number;
    latitude: string;
    longitude: string;
  };

  const workerId = sessionStorage.getItem("id");

  // ------------------ Fetch Client Data ------------------
  useEffect(() => {
    axios
      .get(`https://health-center-repo-production.up.railway.app/clients-map?workerId=${workerId}&id=${clientId}`)
      .then((response) => {
        setClient(response.data[0]); // Assuming response.data is an array; we take the first item
      })
      .catch((error) => {
        console.error("Error fetching client data:", error);
      });
  }, [clientId, workerId]);

  // ------------------ Add Static Graphics: Polygon Border & Labels ------------------
  const addStaticGraphics = () => {
    if (!viewRef.current) return;
    const view = viewRef.current;

    // --- Polygon Border ---
    // Provided coordinates (latitude, longitude) are converted to [lon, lat].
    // (The same coordinate list as used on the admin side.)
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
    // Close the ring
    polygonCoordinates.push(polygonCoordinates[0]);

    const polygon = new Polygon({
      rings: [polygonCoordinates],
      spatialReference: { wkid: 4326 },
    });

    const polygonSymbol = new SimpleFillSymbol({
      color: [0, 0, 0, 0], // transparent fill
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

    // --- Label Graphics ---
    // Define the label points with their coordinates and corresponding text.
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
      });
    });

    // Save static graphics so we can re-add them later.
    staticGraphicsRef.current = [polygonGraphic, ...labelGraphics];

    // Add static graphics to the view
    view.graphics.addMany(staticGraphicsRef.current);
  };

  // ------------------ Initialize & Update Map ------------------
  useEffect(() => {
    if (mapRef.current && !viewRef.current) {
      const map = new Map({ basemap: "osm-3d" });
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [parseFloat(longitude), parseFloat(latitude)], // Client's location as center
        zoom: 12,
      });
      viewRef.current = view;
      console.log("Map initialized.");

      // Add static graphics (polygon border and labels) once the view is ready
      view.when(() => {
        addStaticGraphics();
      });

      // Add a click event to update the client's position.
      view.on("click", (event) => {
        const point = view.toMap({ x: event.x, y: event.y });
        if (client) {
          setClient((prevClient) => ({
            ...prevClient!,
            latitude: point.latitude.toString(),
            longitude: point.longitude.toString(),
          }));

          // Remove all graphics (this clears markers and static graphics)
          view.graphics.removeAll();
          // Re-add the static graphics
          addStaticGraphics();

          // Add a marker at the clicked point
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              color: categoryColors[client.category_id] || [0, 0, 0],
              outline: { color: [255, 255, 255], width: 1 },
            }),
          });
          view.graphics.add(pointGraphic);
        }
      });
    }

    if (viewRef.current && client) {
      // Add the client's marker (if not updated by a click)
      const pointGraphic = new Graphic({
        geometry: new Point({
          longitude: parseFloat(client.longitude),
          latitude: parseFloat(client.latitude),
        }),
        symbol: new SimpleMarkerSymbol({
          color: categoryColors[client.category_id] || [0, 0, 0],
          outline: { color: [255, 255, 255], width: 1 },
        }),
        attributes: { name: client.full_name },
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

  // ------------------ Handle Save ------------------
  const handleSave = () => {
    if (client) {
      axios
        .put(`https://health-center-repo-production.up.railway.app/update-client/${client.id}`, {
          latitude: client.latitude,
          longitude: client.longitude,
        })
        .then(() => {
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
