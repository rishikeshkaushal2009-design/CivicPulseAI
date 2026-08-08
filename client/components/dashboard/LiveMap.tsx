import { MapPin } from "lucide-react";

export default function LiveMap() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          🗺 Live Civic Map
        </h2>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          View Full Map
        </button>
      </div>

      <div className="relative flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950">
        <div className="text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-blue-400" />

          <h3 className="text-xl font-semibold text-white">
            Interactive Map
          </h3>

          <p className="mt-2 text-slate-400">
            Google Maps / Leaflet integration will appear here.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <span className="rounded-full bg-red-500/20 px-4 py-2 text-red-400">
              🔴 Potholes
            </span>

            <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-400">
              🟡 Streetlights
            </span>

            <span className="rounded-full bg-green-500/20 px-4 py-2 text-green-400">
              🟢 Garbage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}