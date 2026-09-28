"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Subtle light gradient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {children}
      </div>
    </main>
  );
}