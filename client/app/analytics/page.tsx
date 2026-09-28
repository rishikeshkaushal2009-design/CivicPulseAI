"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useCivicStore } from '@/lib/useCivicStore';

const MONTHLY_TREND = [
  { month: 'Apr', reported: 180, resolved: 172 },
  { month: 'May', reported: 220, resolved: 210 },
  { month: 'Jun', reported: 310, resolved: 295 },
  { month: 'Jul', reported: 450, resolved: 420 },
  { month: 'Aug', reported: 390, resolved: 375 },
  { month: 'Sep', reported: 340, resolved: 332 },
];

const WARD_PERFORMANCE = [
  { ward: 'Ward 1', score: 83, complaints: 140, resolvedRate: 91 },
  { ward: 'Ward 2', score: 92, complaints: 95, resolvedRate: 97 },
  { ward: 'Ward 3', score: 88, complaints: 210, resolvedRate: 94 },
  { ward: 'Ward 4', score: 79, complaints: 180, resolvedRate: 88 },
  { ward: 'Ward 5', score: 90, complaints: 110, resolvedRate: 96 },
];

const PREDICTIVE_ALERTS = [
  {
    id: 'PRED-01',
    risk: 'High Drainage Inundation Risk',
    ward: 'Ward 4 - Station Corridor',
    probability: '84% Probability',
    recommendation:
      'Pre-monsoon robotic culvert desilting recommended before heavy rainfall cycle next week.',
    color: 'bg-red-50 border-red-200 text-red-900',
  },
  {
    id: 'PRED-02',
    risk: 'Streetlight Feeder Degradation (+35%)',
    ward: 'Ward 2 - Model Colony',
    probability: '72% Probability',
    recommendation:
      'Replace aging transformer breaker box at 5th Avenue feeder pillar to prevent blackout.',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  {
    id: 'PRED-03',
    risk: 'Pothole Density Acceleration',
    ward: 'Ward 3 - Shivaji Nagar (FC Road)',
    probability: '68% Probability',
    recommendation:
      'Heavy bus braking friction detected; schedule polymer modified seal coating within 14 days.',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
  },
];

export default function AnalyticsPage() {
  const { complaints } = useCivicStore();

  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Work Completed'
  ).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const cityScore = totalCount === 0 ? 94 : Math.min(99, Math.max(50, Math.round(70 + resolutionRate * 0.28)));
  const cityGrade =
    cityScore >= 90
      ? 'Grade A+ • Excellent Grid'
      : cityScore >= 80
      ? 'Grade A • Strong Response'
      : 'Grade B • Needs Attention';

  const categoryDistribution = useMemo(() => {
    if (complaints.length === 0) {
      return [
        { name: 'Potholes', count: 0, color: '#3b82f6' },
        { name: 'Garbage & Waste', count: 0, color: '#10b981' },
        { name: 'Streetlights', count: 0, color: '#f59e0b' },
        { name: 'Drainage', count: 0, color: '#6366f1' },
      ];
    }
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#06b6d4', '#ec4899', '#64748b'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      color: colors[idx % colors.length],
    }));
  }, [complaints]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Civic Intelligence & Predictive Municipal Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            City Civic Health & Predictive Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Machine learning forecast models, ward resolution rankings, department SLA benchmarking, and public infrastructure health.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
            {cityScore}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Overall City Score</span>
            <p className="text-xs font-bold text-slate-900">{cityGrade}</p>
          </div>
        </div>
      </div>

      

      {/* CHARTS ROW 1: Monthly Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Complaints Reported vs Resolved
              </h3>
              <p className="text-[11px] text-slate-500">
                Tracking municipal resolution efficiency over 6 months
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              96.8% Average Clearance
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reported"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  name="Reported"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="Resolved"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Complaints by Category
              </h3>
              <p className="text-[11px] text-slate-500">Distribution of urban issue types</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {categoryDistribution.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 font-medium truncate">{c.name}:</span>
                <span className="font-bold text-slate-900">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Ward Civic Health Leaderboard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ward Civic Health Leaderboard & Resolution Rates
            </h3>
            <p className="text-xs text-slate-500">
              Comparative ranking of municipal wards by citizen satisfaction, SLA adherence, and infrastructure maintenance
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            5 Key Wards Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Total Incidents</th>
                <th className="py-3 px-4">Resolution Rate</th>
                <th className="py-3 px-4">Performance Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {WARD_PERFORMANCE.map((w) => (
                <tr key={w.ward} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{w.ward}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-600">{w.score} / 100</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        w.score >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : w.score >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {w.score >= 90 ? 'Grade A+' : w.score >= 85 ? 'Grade A' : 'Grade B+'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{w.complaints}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{w.resolvedRate}%</td>
                  <td className="py-3 px-4 w-48">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${w.resolvedRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
