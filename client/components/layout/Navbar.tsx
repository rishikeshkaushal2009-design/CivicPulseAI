"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCivicStore } from "@/lib/useCivicStore";
import {
  Bell,
  Activity,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, notifications, logout, isAuthenticated } = useCivicStore();

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const isLoginPage =
    pathname === "/login" || pathname === "/register" || (!isAuthenticated && pathname === "/");

  const unreadNotifs = notifications.filter(
    (n) => !n.read && (n.targetRole === role || n.targetRole === "citizen")
  );

  const portalNameMap: Record<string, string> = {
    citizen: "Citizen Reporting & Tracking Portal",
    officer: "Officer Triage Command",
    worker: "Field Workforce Hub",
    admin: "Platform Administration",
    dept_admin: "Commissioner Desk & Civic Health",
  };

  const logoTarget = isAuthenticated
    ? role === "officer"
      ? "/officer"
      : role === "worker"
      ? "/worker"
      : role === "admin"
      ? "/admin"
      : role === "dept_admin"
      ? "/analytics"
      : "/dashboard"
    : "/";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Active Portal Badge */}
          <div className="flex items-center gap-3">
            <Link href={logoTarget} className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform border border-slate-200 bg-slate-950 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="CivicPulse Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    CivicPulse<span className="text-blue-600"> AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                    Gov-Tech
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Connecting Citizens, Workers &amp; Governance
                </p>
              </div>
            </Link>

            {/* Active Portal Badge (Shown when authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center pl-3 border-l border-slate-200">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {portalNameMap[role] || "Municipal Portal"}
                </span>
              </div>
            )}
          </div>

          {/* Right Side: Notifications + Identity + Switch Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell (Shown when authenticated, hidden on login) */}
            {isAuthenticated && !isLoginPage && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-84 max-w-[92vw] bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Notifications ({unreadNotifs.length} new)
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold capitalize">
                        Role: {role.replace("_", " ")}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs transition ${
                              n.type === "emergency"
                                ? "bg-red-50 border-red-200 text-red-900"
                                : n.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-slate-50 border-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold">{n.title}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(n.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                            {n.complaintId && (
                              <Link
                                href={`/track?id=${n.complaintId}`}
                                onClick={() => setShowNotifMenu(false)}
                                className="inline-block mt-1 text-[10px] font-bold text-blue-600 hover:underline"
                              >
                                View Complaint #{n.complaintId} →
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conditional Authenticated View vs Login View */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Active User Badge -> Clicking goes to profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs shadow-2xs transition group"
                  title={`Signed in as ${user.name} (${role.replace("_", " ")}). Click to view profile.`}
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-slate-300 object-cover shrink-0"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-slate-800 text-[11px] leading-tight truncate max-w-[110px] group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </p>
                    <span className="text-[10px] text-blue-600 font-semibold capitalize block leading-tight">
                      {role.replace("_", " ")}
                    </span>
                  </div>
                </Link>

                {/* Switch Account Button -> Logs out & directs to Login to enter credentials */}
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition shadow-2xs cursor-pointer"
                  title="Switch Account - Enter email or username and password"
                >
                  <LogOut className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden md:inline">Switch Account</span>
                  <span className="md:hidden">Switch</span>
                </button>
              </div>
            ) : isLoginPage ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Official Municipal Portal</span>
                <span className="sm:hidden">Gov-Tech</span>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}