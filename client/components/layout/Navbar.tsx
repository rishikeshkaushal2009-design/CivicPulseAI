"use client";

import Link from "next/link";

const navItems = [
  { label: "Features", href: "#" },
  { label: "Map", href: "#" },
  { label: "Analytics", href: "#" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            CP
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              CivicPulse
              <span className="text-blue-500"> AI</span>
            </h1>

            <p className="text-xs text-slate-400">
              Smart City Platform
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-800">
            Login
          </button>

          <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Report Issue
          </button>
        </div>
      </div>
    </header>
  );
}