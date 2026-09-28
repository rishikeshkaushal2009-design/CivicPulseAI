"use client";

import dynamic from "next/dynamic";
import { LocateFixed, MapPin } from "lucide-react";

type Location = {
  latitude: number;
  longitude: number;
};

type LocationPickerProps = {
  location: Location | null;
  onLocationChange: (location: Location | null) => void;
};

const InteractiveMap = dynamic(
  () => import("./InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950">
        <p className="text-slate-400">
          Loading map...
        </p>
      </div>
    ),
  }
);

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    if (!window.isSecureContext) {
      alert(
        "Location access requires HTTPS or localhost."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission was denied. Please allow location access in your browser."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            alert(
              "Your location is currently unavailable."
            );
            break;

          case error.TIMEOUT:
            alert(
              "Location request timed out. Please try again."
            );
            break;

          default:
            alert(
              "Unable to get your location."
            );
        }
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

      {/* Header */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20">
              <MapPin className="h-6 w-6 text-blue-400" />
            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                📍 Complaint Location
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Use your current location or click anywhere
                on the map.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={getLocation}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <LocateFixed size={18} />

          Use Current Location
        </button>

      </div>

      {/* MAP */}

      <div className="mt-6 overflow-hidden rounded-2xl">
        <InteractiveMap
          location={location}
          onLocationChange={onLocationChange}
        />
      </div>

      {/* LOCATION INFORMATION */}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">

        <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />

        <div>

          <p className="font-medium text-white">
            {location
              ? "Location selected"
              : "No location selected"}
          </p>

          {location ? (
            <p className="mt-1 text-sm text-slate-400">
              Latitude:{" "}
              {location.latitude.toFixed(6)}
              <br />
              Longitude:{" "}
              {location.longitude.toFixed(6)}
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