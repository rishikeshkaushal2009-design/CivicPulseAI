"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Camera,
  Search,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Mic,
  Activity,
  Building2,
  HardHat,
  Vote,
  Shield,
  Compass,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { UserRole } from '@/types/civic';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { complaints, upvoteComplaint, user, role } = useCivicStore();

  // Citizen's own submitted complaints
  const myComplaints = complaints.filter(
    (c) => c.citizenId === user.id || c.citizenName.toLowerCase() === user.name.toLowerCase()
  );

  // Nearby complaints in citizen's ward
  const citizenWard = user.ward || 'Ward 3 - Shivaji Nagar';
  const nearbyComplaints = complaints.filter((c) =>
    c.location.ward.toLowerCase().includes(citizenWard.toLowerCase().split(' ')[0]) ||
    c.location.ward.includes('Ward 3') ||
    c.location.ward.includes('Shivaji')
  );

  const roleRedirectMap: Record<UserRole, { label: string; route: string; color: string; icon: any }> = {
    citizen: { label: 'Citizen Portal', route: '/dashboard', color: 'bg-blue-600', icon: Users },
    officer: { label: 'Officer Triage Command', route: '/officer', color: 'bg-purple-600', icon: Building2 },
    worker: { label: 'Field Worker Hub', route: '/worker', color: 'bg-amber-600', icon: HardHat },
    admin: { label: 'Platform Admin & Revenue', route: '/admin', color: 'bg-emerald-600', icon: Shield },
    dept_admin: { label: 'Commissioner Analytics', route: '/analytics', color: 'bg-indigo-600', icon: Compass },
  };

  const currentRolePortal = roleRedirectMap[role];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Active Account Status Bar */}
      <div className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">
            Authenticated Citizen: <strong className="text-slate-900 font-bold">{user.name}</strong>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider border border-blue-200">
            {user.ward || 'Ward 3'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Need to access another role?</span>
          <button
            onClick={() => {
              router.push('/login');
            }}
            className="text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Switch Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Non-Citizen Role Banner Alert if user is on citizen dashboard */}
      {role !== 'citizen' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <currentRolePortal.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                You are currently signed in as {user.name} ({role.replace('_', ' ').toUpperCase()})
              </p>
              <p className="text-[11px] text-amber-800">
                You are viewing the Citizen Reporting Portal. To manage your official responsibilities, open your dedicated portal.
              </p>
            </div>
          </div>
          <Link
            href={currentRolePortal.route}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${currentRolePortal.color} hover:opacity-90 transition shrink-0 flex items-center gap-1.5`}
          >
            <span>Open {currentRolePortal.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Citizen Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome, {user.name} • {user.ward || 'Shivaji Nagar (Ward 3)'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user.ward || 'Shivaji Nagar Civic Command (Ward 3)'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Report local civic hazards, support neighborhood repair initiatives, track real-time resolution timelines, and verify completed municipal works.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/report"
            className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
          <Link
            href="/track"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>Track by ID</span>
          </Link>
        </div>
      </div>

      {/* Citizen Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">My Reports</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{myComplaints.length}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Submitted by {user.name}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active In-Progress</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {myComplaints.filter((c) => c.status !== 'Resolved').length}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Under resolution</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Resolved For Me</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {myComplaints.filter((c) => c.status === 'Resolved').length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Verified & Closed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ward Civic Health</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">88 / 100</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Grade A (High)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Submitted Complaints (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  My Submitted Civic Complaints
                </h3>
                <p className="text-xs text-slate-500">Live lifecycle tracking & verification</p>
              </div>
              <Link href="/report" className="text-xs font-bold text-blue-600 hover:underline">
                + New Report
              </Link>
            </div>

            {myComplaints.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500">
                  No complaints filed under <strong>{user.name}</strong> yet.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Report First Issue Now</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myComplaints.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50/30 hover:border-blue-300 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                            {item.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location.address}</span>
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Assigned to: <strong className="text-slate-800">{item.department}</strong>
                      </span>

                      <Link
                        href={`/track?id=${item.id}`}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>View 10-Stage Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearby Issues in Ward with 1-Click Upvote (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Nearby Issues in Ward ({nearbyComplaints.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Support neighbors to elevate municipal repair priority
                </p>
              </div>
              <Vote className="w-4 h-4 text-blue-600" />
            </div>

            <div className="space-y-3">
              {nearbyComplaints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 text-[11px]">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {item.category}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 leading-snug">{item.title}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.location.address}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium text-[11px]">
                      {item.upvotes} Citizens Supported
                    </span>

                    <button
                      onClick={() => upvoteComplaint(item.id)}
                      className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold transition flex items-center gap-1.5 border border-blue-200"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Support Issue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Voice Complaint Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Mic className="w-4 h-4 text-indigo-600" />
              <span>Multilingual Voice Complaint</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Don't want to type? Speak in English, Hindi, or Marathi. CivicPulse AI converts your speech into a structured municipal complaint with automatic category detection.
            </p>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 font-bold text-indigo-700 hover:underline pt-1"
            >
              <span>Try Voice Recording Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}