"use client";

import { useEffect, useRef } from 'react';
import { Complaint, HotspotZone, FieldWorker } from '@/types/civic';

interface FullCivicMapProps {
  complaints: Complaint[];
  hotspots: HotspotZone[];
  workers: FieldWorker[];
  showHotspots: boolean;
  showWorkers: boolean;
  selectedComplaintId?: string;
  onSelectComplaint: (c: Complaint) => void;
}

export default function FullCivicMap({
  complaints,
  hotspots,
  workers,
  showHotspots,
  showWorkers,
  selectedComplaintId,
  onSelectComplaint,
}: FullCivicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Base Map Initialization
      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          center: [18.5204, 73.8567],
          zoom: 13,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const group = L.layerGroup().addTo(map);
        mapRef.current = map;
        layerGroupRef.current = group;
      }

      const map = mapRef.current;
      const group = layerGroupRef.current;
      group.clearLayers();

      // Custom Pin Icons
      const getPinIcon = (priority: string, isResolved: boolean) => {
        const color = isResolved ? '#10b981' : priority === 'Critical' ? '#ef4444' : priority === 'High' ? '#f97316' : '#3b82f6';
        return L.divIcon({
          className: 'custom-civic-pin',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      };

      const workerIcon = L.divIcon({
        className: 'custom-worker-pin',
        html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">👷</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // 1. Plot Complaints
      complaints.forEach((c) => {
        if (!c.location || !c.location.latitude || !c.location.longitude) return;

        const isResolved = c.status === 'Resolved';
        const marker = L.marker([c.location.latitude, c.location.longitude], {
          icon: getPinIcon(c.priority, isResolved),
        }).addTo(group);

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 2px;">${c.id} • ${c.category}</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${c.title}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${c.location.address}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: ${c.priority === 'Critical' ? '#dc2626' : '#d97706'};">${c.priority}</span>
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${c.status}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onSelectComplaint(c);
        });
      });

      // 2. Plot Active Workers (if enabled)
      if (showWorkers) {
        workers.forEach((w) => {
          if (w.currentLocation) {
            const marker = L.marker([w.currentLocation.latitude, w.currentLocation.longitude], {
              icon: workerIcon,
            }).addTo(group);

            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px;">
                <div style="font-weight: 800; color: #b45309;">👷 Field Technician</div>
                <div style="font-weight: 700; color: #0f172a;">${w.fullName} (★ ${w.rating})</div>
                <div style="color: #64748b; font-size: 11px;">Status: ${w.availability}</div>
              </div>
            `);
          }
        });
      }

      // 3. Plot AI Civic Hotspots (if enabled)
      if (showHotspots) {
        hotspots.forEach((h) => {
          const circle = L.circle([h.latitude, h.longitude], {
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.22,
            radius: h.radiusMeters,
            weight: 2,
            dashArray: '4, 4',
          }).addTo(group);

          circle.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; max-width: 220px;">
              <div style="font-weight: 800; color: #dc2626; font-size: 11px;">🔥 AI CIVIC HOTSPOT</div>
              <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${h.name}</div>
              <div style="color: #475569; font-size: 11px; margin-top: 4px;">Frequency: <strong>${h.frequencyCount} incidents</strong> (${h.category})</div>
              <div style="color: #64748b; font-size: 10px; margin-top: 4px; font-style: italic;">"${h.aiDiagnostic}"</div>
            </div>
          `);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [complaints, hotspots, workers, showHotspots, showWorkers, onSelectComplaint]);

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
