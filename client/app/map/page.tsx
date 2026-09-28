"use client";

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Filter,
  Flame,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { Complaint, ComplaintCategory, HotspotZone } from '@/types/civic';

const FullCivicMap = dynamic(() => import('@/components/map/FullCivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 text-sm">
      Loading interactive civic map...
    </div>
  ),
});

export default function MapPage() {
  const { complaints, workers } = useCivicStore();
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(complaints[0] || null);

  // Dynamically cluster complaints into real Hotspots
  const hotspots: HotspotZone[] = useMemo(() => {
    const wardGroups: Record<string, Complaint[]> = {};
    complaints.forEach((c) => {
      const ward = c.location?.ward || 'General';
      if (!wardGroups[ward]) wardGroups[ward] = [];
      wardGroups[ward].push(c);
    });

    return Object.entries(wardGroups)
      .filter(([_, list]) => list.length >= 2)
      .map(([ward, list], i) => ({
        id: `HOTSPOT-${i + 1}`,
        name: `${ward} Issue Cluster`,
        ward,
        category: list[0].category,
        frequencyCount: list.length,
        riskLevel: (list.some((c) => c.priority === 'Critical')
          ? 'Severe Hazard'
          : list.length >= 4
          ? 'High'
          : 'Moderate') as 'Moderate' | 'High' | 'Severe Hazard',
        latitude: list[0].location.latitude,
        longitude: list[0].location.longitude,
        radiusMeters: 350,
        aiDiagnostic: `Identified ${list.length} reported issues clustered in ${ward}. Recommends scheduled civil inspection.`,
        suggestedPreventativeAction: `Deploy technical maintenance team to ${ward} for proactive repair before escalation.`,
      }));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchCat = selectedCat === 'All' || c.category === selectedCat;
      const matchPri = selectedPriority === 'All' || c.priority === selectedPriority;
      const matchStatus =
        selectedStatus === 'All'
          ? true
          : selectedStatus === 'Resolved'
          ? c.status === 'Resolved'
          : c.status !== 'Resolved';
      return matchCat && matchPri && matchStatus;
    });
  }, [complaints, selectedCat, selectedPriority, selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Smart City Geographic Telemetry Grid</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Civic Map & AI Hotspot Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time geospatial visualization of citizen complaints, active field technicians, municipal project works, and recurring issue clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/report"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
          >
            + Report at My Location
          </Link>
        </div>
      </div>

      {/* Layer Toggles & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Broken streetlight">Streetlights</option>
            <option value="Garbage">Garbage</option>
            <option value="Drainage">Drainage</option>
            <option value="Water supply">Water Supply</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">🚨 Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Unresolved</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded text-red-600"
            />
            <span className="flex items-center gap-1 text-red-700">
              <Flame className="w-3.5 h-3.5" />
              AI Hotspots ({hotspots.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWorkers}
              onChange={(e) => setShowWorkers(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span className="flex items-center gap-1 text-amber-800">
              <HardHat className="w-3.5 h-3.5" />
              Active Workers ({workers.length})
            </span>
          </label>
        </div>
      </div>

      {/* Map + Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <FullCivicMap
            complaints={filteredComplaints}
            hotspots={hotspots}
            workers={workers}
            showHotspots={showHotspots}
            showWorkers={showWorkers}
            selectedComplaintId={activeComplaint?.id}
            onSelectComplaint={(c) => setActiveComplaint(c)}
          />
        </div>

        {/* Selected Complaint / Hotspot Info Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {activeComplaint ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {activeComplaint.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeComplaint.priority === 'Critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {activeComplaint.priority} Priority
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {activeComplaint.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeComplaint.title}
                </h3>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  {activeComplaint.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-bold text-slate-800">{activeComplaint.location.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ward:</span>
                  <span className="font-bold text-slate-800">{activeComplaint.location.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">{activeComplaint.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-blue-600">{activeComplaint.status}</span>
                </div>
              </div>

              <Link
                href={`/track?id=${activeComplaint.id}`}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Open Full Tracking Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
              Click any pin on the map to inspect ticket details.
            </div>
          )}

          {/* AI Hotspots Summary List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-red-700">
              <Flame className="w-4 h-4 text-red-600" />
              <span>AI-Detected Civic Hotspots</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Recurring civic clusters requiring preventative infrastructure overhaul
            </p>

            <div className="space-y-2 pt-1">
              {hotspots.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <p className="text-xs font-bold text-slate-700">No active hotspot clusters</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    When multiple citizen reports converge within proximity, AI spatial clustering will automatically highlight hotspots here.
                  </p>
                </div>
              ) : (
                hotspots.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-red-50/60 border border-red-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.name}</span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                        {h.frequencyCount} reports
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{h.aiDiagnostic}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}