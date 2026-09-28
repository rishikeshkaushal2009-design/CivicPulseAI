"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

type WorkerLocationMapProps = {
  latitude: number;
  longitude: number;
  title: string;
  complaintId: string;
};

type WorkerLocation = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  return null;
}

const workerIcon = L.divIcon({
  className: "worker-location-marker",
  html: `
    <div style="
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #2563eb;
      border: 4px solid white;
      box-shadow: 0 3px 12px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    ">
      🔧
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

export default function WorkerLocationMap({
  latitude,
  longitude,
  title,
  complaintId,
}: WorkerLocationMapProps) {
  const [workerLocation, setWorkerLocation] =
    useState<WorkerLocation | null>(null);

  const lastLocationRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    const fetchWorkerLocation = async () => {
      try {
        const response = await fetch(
          `/api/worker-location?complaintId=${encodeURIComponent(
            complaintId
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          !cancelled &&
          data.success &&
          data.location
        ) {
          const locationKey = `${data.location.latitude},${data.location.longitude}`;

          if (locationKey !== lastLocationRef.current) {
            lastLocationRef.current = locationKey;
            setWorkerLocation(data.location);
          }
        }
      } catch (error) {
        console.error(
          "Unable to fetch worker location:",
          error
        );
      }
    };

    fetchWorkerLocation();

    const interval = setInterval(
      fetchWorkerLocation,
      3000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [complaintId]);

  const workerLat =
  workerLocation?.latitude ?? latitude;

const workerLng =
  workerLocation?.longitude ?? longitude;

const navigateToComplaint = () => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={true}
          className="h-[360px] w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenter
            latitude={workerLat}
            longitude={workerLng}
          />

          <Marker
            position={[workerLat, workerLng]}
            icon={workerIcon}
          >
            <Popup>
              <div>
                <strong>{title}</strong>
                <br />
                <span>
                  Worker location
                </span>
                <br />
                <span>
                  {workerLat.toFixed(6)},{" "}
                  {workerLng.toFixed(6)}
                </span>

                {workerLocation && (
                  <>
                    <br />
                    <span>
                      Updated:{" "}
                      {new Date(
                        workerLocation.timestamp
                      ).toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            📍
          </div>

          <div>
            <p className="font-semibold text-blue-400">
              Worker Live Location
            </p>

            {workerLocation ? (
              <p className="text-sm text-slate-300">
                Live location received
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Waiting for worker location...
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-slate-950/60 p-3 text-xs text-slate-400">
        <p>
          Latitude: {workerLat.toFixed(6)}
          </p>
          
          <p>
            Longitude: {workerLng.toFixed(6)}
            </p>
            {workerLocation && (
              <p className="mt-1 text-green-400">
                ● Updated{" "}
                {new Date(
                  workerLocation.timestamp
                  ).toLocaleTimeString()}
                  </p>
                )}
                </div>
                
                <button
                type="button"
                onClick={navigateToComplaint}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  🧭 Navigate to Complaint
                  </button>
      </div>
    </div>
  );
}