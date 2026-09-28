"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  department: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
};

const CivicMap = dynamic(
  () => import("./CivicMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center bg-slate-950">
        <p className="text-slate-400">
          Loading Civic Map...
        </p>
      </div>
    ),
  }
);

export default function LiveMap() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const loadComplaints = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "civicpulse_complaints"
        ) || "[]"
      );

      setComplaints(
        Array.isArray(saved) ? saved : []
      );
    } catch {
      setComplaints([]);
    }
  };

  useEffect(() => {
    loadComplaints();

    const interval = setInterval(
      loadComplaints,
      2000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const complaintsWithLocation =
    complaints.filter(
      (complaint) =>
        typeof complaint.latitude === "number" &&
        typeof complaint.longitude === "number"
    );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <MapPin className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Live Civic Map
            </h2>

            <p className="text-sm text-slate-500">
              View reported civic issues
            </p>
          </div>

        </div>

        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View Full Map
        </button>

      </div>

      {/* Map */}

      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <CivicMap complaints={complaints} />
      </div>

      {/* Legend */}

      <div className="mt-5 flex flex-wrap gap-3">

        <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-400">
          🔴 Potholes
        </span>

        <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm text-yellow-400">
          🟡 Streetlights
        </span>

        <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
          🟢 Garbage
        </span>

      </div>

      {/* Status */}

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">

        <p className="text-sm text-slate-400">
          {complaintsWithLocation.length} complaint
          {complaintsWithLocation.length !== 1
            ? "s"
            : ""}{" "}
          currently visible on the map.
        </p>

      </div>

    </div>
  );
}