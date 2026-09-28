"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  HardHat,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';

export default function FundsPage() {
  const { projects } = useCivicStore();
  const [filterDept, setFilterDept] = useState('All');
  const [search, setSearch] = useState('');

  const totalAllocated = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spentBudget, 0);
  const totalRemaining = projects.reduce((sum, p) => sum + p.remainingBudget, 0);
  const avgCompletion = Math.round(
    projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length
  );

  const filtered = projects.filter((p) => {
    const matchDept = filterDept === 'All' || p.department === filterDept;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.contractorOrWorker.toLowerCase().includes(search.toLowerCase()) ||
      p.ward.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Civic Audit & Transparency Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Government Funds & Municipal Project Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time public oversight of smart city capital expenditures, contractor deliverables, milestone progress, and remaining municipal balances.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Audit Status: 100% Publicly Verifiable</span>
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Allocated Budget</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{(totalAllocated / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">Sanctioned Public Funds</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Amount Disbursed & Spent</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹{(totalSpent / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {((totalSpent / totalAllocated) * 100).toFixed(1)}% Capital Utilized
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Remaining Treasury Budget</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            ₹{(totalRemaining / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-slate-500">Milestone Escrowed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Project Completion</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{avgCompletion}%</p>
          <span className="text-[10px] text-amber-600 font-semibold">On Target Delivery</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, contractor, or ward..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
        </div>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium outline-none"
        >
          <option value="All">All Municipal Departments</option>
          <option value="Roads & Infrastructure Department">Roads & Infrastructure</option>
          <option value="Electrical & Street Lighting Department">Electrical & Lighting</option>
          <option value="Drainage & Sewage Management Department">Drainage & Sewage</option>
          <option value="Sanitation & Solid Waste Management">Sanitation & Waste</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {proj.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    proj.projectStatus === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : proj.projectStatus === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {proj.projectStatus}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{proj.description}</p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{proj.ward} • {proj.department}</span>
              </div>
            </div>

            {/* Progress Bar & Financial Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1.5">
                  <span>Milestone Completion</span>
                  <span className="text-blue-600">{proj.completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${proj.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Budget</span>
                  <span className="font-bold text-slate-900">
                    ₹{(proj.allocatedBudget / 100000).toFixed(0)}L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Spent</span>
                  <span className="font-bold text-emerald-600">
                    ₹{(proj.spentBudget / 100000).toFixed(0)}L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Remaining</span>
                  <span className="font-bold text-indigo-600">
                    ₹{(proj.remainingBudget / 100000).toFixed(0)}L
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Contractor: <strong className="text-slate-800">{proj.contractorOrWorker}</strong></span>
                <span>Target: {proj.targetEndDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
