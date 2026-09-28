"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HardHat,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  AlertOctagon,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { Complaint, PriorityLevel } from '@/types/civic';

const DEPARTMENTS = [
  'Roads & Infrastructure Department',
  'Sanitation & Solid Waste Management',
  'Electrical & Street Lighting Department',
  'Water Supply Department',
  'Drainage & Sewage Management Department',
  'Public Safety & Traffic Control',
];

export default function OfficerPage() {
  const {
    complaints,
    workers,
    assignWorker,
    overrideDepartment,
    overridePriority,
    escalateComplaint,
    addComment,
    user,
  } = useCivicStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [officerMsg, setOfficerMsg] = useState('');

  // Statistics
  const total = complaints.length;
  const critical = complaints.filter((c) => c.priority === 'Critical').length;
  const pending = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'AI Analyzed' || c.status === 'Department Assigned'
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === 'Officer Reviewed' || c.status === 'Worker Assigned' || c.status === 'Work Started'
  ).length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.location.address.toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === 'All' || c.department === selectedDept;
      const matchPriority = selectedPriority === 'All' || c.priority === selectedPriority;
      const matchStatus =
        selectedStatus === 'All'
          ? true
          : selectedStatus === 'Resolved'
          ? c.status === 'Resolved'
          : selectedStatus === 'Pending'
          ? c.status === 'Submitted' || c.status === 'Department Assigned'
          : c.status !== 'Resolved';

      return matchSearch && matchDept && matchPriority && matchStatus;
    });
  }, [complaints, search, selectedDept, selectedPriority, selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Municipal Officer Operations Command</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Officer Triage & Dispatch Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming AI classifications, override department routing, assign verified field technicians, and resolve citizen issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Map View</span>
          </Link>
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
            Officer: <strong>{user.name}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Tickets</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          <span className="text-[10px] text-slate-500">All registered incidents</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-xs">
          <span className="text-[11px] font-bold text-red-500 uppercase">Critical Priority</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{critical}</p>
          <span className="text-[10px] text-red-500 font-semibold">4h SLA Emergency</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase">Pending Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pending}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Needs Officer Dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500 uppercase">In Field Progress</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{inProgress}</p>
          <span className="text-[10px] text-slate-500">Technician on site</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolved}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Citizen Confirmed</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket ID, title, address..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none font-medium"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Action</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Municipal Complaints Queue ({filtered.length} tickets)
          </h3>
          <span className="text-xs text-slate-500">Click ticket to review or assign technician</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Title & Ward</th>
                <th className="py-3 px-4">Department (AI)</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-700 text-sm">No complaints currently in triage queue</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        When citizens report new civic issues, they will appear here with AI vision classifications and priority recommendations.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    <Link href={`/track?id=${item.id}`} className="hover:underline">
                      {item.id}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location.address}</span>
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="line-clamp-1">{item.department}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.priority} ({item.slaHours}h)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {item.assignedWorkerName ? (
                      <span className="text-slate-900 font-semibold flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5 text-amber-600" />
                        {item.assignedWorkerName}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveComplaint(item)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs transition"
                    >
                      Review & Assign
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Assign Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-purple-300">
                  {activeComplaint.id}
                </span>
                <h3 className="text-lg font-bold">{activeComplaint.title}</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  {activeComplaint.location.address} ({activeComplaint.location.ward})
                </p>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white/80"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* AI Diagnostic details */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Diagnostic Overview</span>
                </span>
                <p className="text-slate-700">{activeComplaint.aiAnalysis?.summary}</p>
                <p className="text-purple-900">
                  <strong>Suggested Action:</strong> {activeComplaint.aiAnalysis?.suggestedAction}
                </p>
              </div>

              {/* 1. Change Department (Override AI) */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Department Routing (Officer Override):
                </label>
                <div className="flex gap-2">
                  <select
                    value={activeComplaint.department}
                    onChange={(e) => {
                      overrideDepartment(activeComplaint.id, e.target.value);
                      setActiveComplaint({ ...activeComplaint, department: e.target.value });
                    }}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Change Priority */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Change Priority / SLA:</label>
                <div className="flex gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as PriorityLevel[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        overridePriority(activeComplaint.id, p);
                        setActiveComplaint({ ...activeComplaint, priority: p });
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        activeComplaint.priority === p
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Assign Verified Field Worker */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Assign Verified Field Technician:
                </label>
                <div className="space-y-2">
                  {workers.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                      <p className="text-xs font-bold text-slate-700">No field technicians registered yet</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        When technicians register with the Field Worker role, they will automatically appear here with their skills for 1-click dispatch.
                      </p>
                    </div>
                  ) : (
                    workers.map((w) => (
                      <div
                        key={w.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          activeComplaint.assignedWorkerId === w.id
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{w.fullName}</span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              ★ {w.rating}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Skills: {w.skills.join(', ')} • {w.completedJobsCount} jobs completed
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            assignWorker(activeComplaint.id, w.id);
                            setActiveComplaint({
                              ...activeComplaint,
                              assignedWorkerId: w.id,
                              assignedWorkerName: w.fullName,
                              status: 'Worker Assigned',
                            });
                            alert(`Dispatched ${w.fullName} with payout ₹4,000 for ticket ${activeComplaint.id}!`);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                            activeComplaint.assignedWorkerId === w.id
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          {activeComplaint.assignedWorkerId === w.id ? 'Assigned ✓' : 'Dispatch'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. Escalate to Commissioner */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-700 block">SLA Escalation Protocol</span>
                  <span className="text-[11px] text-slate-500">
                    Escalate ticket directly to Municipal Commissioner Office
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    escalateComplaint(activeComplaint.id, 'Officer intervention: Complex municipal bottleneck');
                    alert(`Complaint #${activeComplaint.id} escalated directly to Municipal Commissioner.`);
                    setActiveComplaint(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-bold transition"
                >
                  🚨 Escalate
                </button>
              </div>

              {/* 5. Send message to citizen */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Post Officer Update / Message to Citizen:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={officerMsg}
                    onChange={(e) => setOfficerMsg(e.target.value)}
                    placeholder="e.g. Road crew scheduled for morning inspection at 9 AM..."
                    className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (officerMsg.trim()) {
                        addComment(activeComplaint.id, officerMsg);
                        setOfficerMsg('');
                        alert('Message posted to citizen timeline.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}