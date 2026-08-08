"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

type Location = {
  latitude: number;
  longitude: number;
};

interface InteractiveMapProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
}

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (location: Location) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function InteractiveMap({
  location,
  onLocationChange,
}: InteractiveMapProps) {
  const defaultLocation = location ?? {
    latitude: 20.5937,
    longitude: 78.9629,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700">
      <MapContainer
        center={[defaultLocation.latitude, defaultLocation.longitude]}
        zoom={location ? 16 : 5}
        scrollWheelZoom={true}
        className="h-80 w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationChange={onLocationChange} />

        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={markerIcon}
          />
        )}
      </MapContainer>

      {location && (
        <div className="bg-slate-950 p-4 text-sm text-slate-300">
          📍 Selected:{" "}
          <span className="text-blue-400">
            {location.latitude.toFixed(6)},{" "}
            {location.longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}