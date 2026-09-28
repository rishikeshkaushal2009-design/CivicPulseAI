"use client";

import { useEffect, useRef } from "react";
import { MapPin, Navigation, Compass } from "lucide-react";

interface IndiaPincodeWardMapProps {
  latitude: number;
  longitude: number;
  pincode?: string;
  city?: string;
  state?: string;
  wardName?: string;
  wardNumber?: number;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectQuickPin?: (pincode: string) => void;
}

const QUICK_TEST_PINS = [
  { label: "Patna", pin: "800020", state: "Bihar" },
  { label: "Pune", pin: "411005", state: "Maharashtra" },
  { label: "Delhi", pin: "110001", state: "Delhi NCR" },
  { label: "Mumbai", pin: "400001", state: "Maharashtra" },
  { label: "Bengaluru", pin: "560001", state: "Karnataka" },
  { label: "Kolkata", pin: "700001", state: "West Bengal" },
];

export default function IndiaPincodeWardMap({
  latitude,
  longitude,
  pincode,
  city = "Pune",
  state = "India",
  wardName,
  wardNumber,
  onMapClick,
  onSelectQuickPin,
}: IndiaPincodeWardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const customPinIcon = L.divIcon({
        className: "custom-india-ward-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.3); white-space: nowrap; border: 1.5px solid white;">
              📍 ${wardNumber ? `Ward ${wardNumber}` : "Municipal Ward"}
            </div>
            <div style="width: 16px; height: 16px; background-color: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px #2563eb; margin-top: -2px;"></div>
            <div style="width: 24px; height: 24px; background: rgba(37, 99, 235, 0.3); border-radius: 50%; position: absolute; bottom: -4px; z-index: -1; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      // Initialize map instance if not yet created
      if (!mapInstanceRef.current) {
        const initialZoom = pincode && pincode.length === 6 ? 13 : 5;
        const initialCenter: [number, number] = [latitude, longitude];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
          maxZoom: 18,
          minZoom: 4,
        }).addTo(map);

        // Marker
        const marker = L.marker([latitude, longitude], {
          draggable: true,
          icon: customPinIcon,
        }).addTo(map);

        // Ward boundary circle (approx. 800m municipal radius)
        const circle = L.circle([latitude, longitude], {
          radius: 800,
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "4, 4",
        }).addTo(map);

        marker.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          circle.setLatLng(pos);
          if (onMapClick) {
            onMapClick(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
          }
        });

        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          circle.setLatLng(e.latlng);
          if (onMapClick) {
            onMapClick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
          }
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;
      } else {
        const map = mapInstanceRef.current;
        const targetZoom = pincode && pincode.length === 6 ? 13 : map.getZoom();

        map.flyTo([latitude, longitude], targetZoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          markerRef.current.setIcon(customPinIcon);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([latitude, longitude]);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, pincode, wardNumber, onMapClick]);

  return (
    <div className="space-y-2">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>India Geospatial Municipal Grid &amp; Ward Locator</span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          🇮🇳 Live India Post &amp; GIS
        </span>
      </div>

      {/* Map Canvas with Floating Badge */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Geo Status Card */}
        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-xs max-w-[260px] pointer-events-none">
          <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[11px] mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {city} ({pincode || "411005"}), {state}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
            {wardNumber ? `Ward ${wardNumber}` : "Ward"} • {wardName || "Urban Ward Zone"}
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
            GPS: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </p>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-slate-900/80 text-white backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 shadow-xs pointer-events-none">
          <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Click anywhere on India map or drag pin to position</span>
        </div>
      </div>

      {/* Quick Test Pill Buttons for Major Indian Cities */}
      {onSelectQuickPin && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Try Cities:</span>
          {QUICK_TEST_PINS.map((q) => (
            <button
              key={q.pin}
              type="button"
              onClick={() => onSelectQuickPin(q.pin)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                pincode === q.pin
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              }`}
            >
              {q.label} ({q.pin})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
