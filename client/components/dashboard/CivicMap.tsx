"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  department: string;
  latitude?: number;
  longitude?: number;
};

type CivicMapProps = {
  complaints: Complaint[];
};

const defaultCenter: [number, number] = [
  20.5937,
  78.9629,
];

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}

function createIcon(category: string) {
  let emoji = "📍";

  const value = category.toLowerCase();

  if (value.includes("pothole")) {
    emoji = "🔴";
  } else if (value.includes("street")) {
    emoji = "🟡";
  } else if (
    value.includes("garbage") ||
    value.includes("sanitation")
  ) {
    emoji = "🟢";
  }

  return L.divIcon({
    className: "civicpulse-marker",
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:#0f172a;
        border:2px solid #3b82f6;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        box-shadow:0 4px 12px rgba(0,0,0,0.4);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export default function CivicMap({
  complaints,
}: CivicMapProps) {
  const complaintsWithLocation =
    complaints.filter(
      (complaint) =>
        typeof complaint.latitude === "number" &&
        typeof complaint.longitude === "number"
    );

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      scrollWheelZoom
      className="h-80 w-full"
    >
      <MapResizeHandler />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {complaintsWithLocation.map(
        (complaint) => (
          <Marker
            key={complaint.id}
            position={[
              complaint.latitude!,
              complaint.longitude!,
            ]}
            icon={createIcon(
              complaint.category
            )}
          >
            <Popup>
              <div className="min-w-[220px]">
                <h3 className="font-bold text-slate-900">
                  {complaint.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {complaint.description}
                </p>

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>
                    <strong>ID:</strong>{" "}
                    {complaint.id}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {complaint.category}
                  </p>

                  <p>
                    <strong>Priority:</strong>{" "}
                    {complaint.priority}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {complaint.status}
                  </p>

                  <p>
                    <strong>Department:</strong>{" "}
                    {complaint.department}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      )}
    </MapContainer>
  );
}