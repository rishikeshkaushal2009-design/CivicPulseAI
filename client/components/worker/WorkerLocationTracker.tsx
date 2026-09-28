"use client";

import { useEffect, useState } from "react";

type WorkerLocationTrackerProps = {
  complaintId: string;
  active: boolean;
};

type Location = {
  latitude: number;
  longitude: number;
};

export default function WorkerLocationTracker({
  complaintId,
  active,
}: WorkerLocationTrackerProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) {
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    const sendLocationToServer = async (
      newLocation: Location
    ) => {
      try {
        const response = await fetch("/api/worker-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complaintId,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Location update failed: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Worker location sent:", data);
      } catch (apiError) {
        console.error(
          "Unable to send worker location:",
          apiError
        );
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Update UI immediately
        setLocation(newLocation);
        setError("");

        // Save locally
        try {
          localStorage.setItem(
            `civicpulse_worker_location_${complaintId}`,
            JSON.stringify({
              ...newLocation,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch (storageError) {
          console.error(
            "Unable to save worker location:",
            storageError
          );
        }

        // Send location to API
        sendLocationToServer(newLocation);
      },
      (geoError) => {
        console.error(
          "Worker location error:",
          geoError
        );

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied."
          );
        } else if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          setError(
            "Worker location is unavailable."
          );
        } else if (
          geoError.code === geoError.TIMEOUT
        ) {
          setError(
            "Location request timed out."
          );
        } else {
          setError(
            "Unable to get worker location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [complaintId, active]);

  if (!active) {
    return (
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-400">
          Worker location tracking is inactive.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
          📍
        </div>

        <div>
          <p className="font-semibold text-blue-400">
            Worker Location Tracking
          </p>

          {location ? (
            <p className="text-sm text-slate-300">
              Live location active
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              Waiting for location...
            </p>
          )}
        </div>
      </div>

      {location && (
        <div className="mt-3 rounded-lg bg-slate-950/60 p-3 text-xs text-slate-400">
          <p>
            Latitude:{" "}
            {location.latitude.toFixed(6)}
          </p>

          <p>
            Longitude:{" "}
            {location.longitude.toFixed(6)}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}