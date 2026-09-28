"use client";

import Link from "next/link";
import {
  Home,
  FilePlus,
  AlertTriangle,
  ClipboardList,
  Map,
  Landmark,
  Bell,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Register Complaint",
    href: "/report",
    icon: FilePlus,
  },
  {
    label: "Emergency",
    href: "/emergency",
    icon: AlertTriangle,
  },
  {
    label: "My Complaints",
    href: "/track",
    icon: ClipboardList,
  },
  {
    label: "Civic Map",
    href: "/map",
    icon: Map,
  },
  {
    label: "Government Funds",
    href: "/funds",
    icon: Landmark,
  },
];

export default function CitizenNavbar() {
  return (
    <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-lg backdrop-blur">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
            <img
              src="/logo.png"
              alt="CivicPulse Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              CivicPulse
            </h1>

            <p className="text-xs text-slate-500">
              Citizen Portal
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />

                <span className="hidden xl:inline">
                  {item.label}
                </span>
              </Link>
            );
          })}

        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-blue-500/40 hover:text-white"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
              3
            </span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 transition hover:border-blue-500/40"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <User className="h-4 w-4 text-white" />
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white">
                Citizen
              </p>

              <p className="text-[10px] text-slate-500">
                My Profile
              </p>
            </div>
          </Link>

        </div>

      </div>

    </header>
  );
}