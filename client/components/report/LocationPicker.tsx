"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";

type Location = {
  latitude: number;
  longitude: number;
};

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-950 text-slate-400">
      Loading map...
    </div>
  ),
});

export default function LocationPicker() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);

        alert(
          "Unable to get your location. Please allow location permission and try again."
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            📍 Complaint Location
          </h2>

          <p className="mt-2 text-slate-400">
            Use your current location or click anywhere on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={getLocation}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocateFixed size={18} />

          {loading ? "Locating..." : "Use Current Location"}
        </button>
      </div>

      <InteractiveMap
        location={location}
        onLocationChange={setLocation}
      />

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

        <div>
          <p className="font-medium text-white">
            {location ? "Location selected" : "No location selected"}
          </p>

          {location ? (
            <p className="mt-1 text-sm text-slate-400">
              Latitude: {location.latitude.toFixed(6)}
              <br />
              Longitude: {location.longitude.toFixed(6)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Click the map or use your current location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}