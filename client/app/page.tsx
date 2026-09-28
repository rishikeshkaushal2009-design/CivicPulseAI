"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useCivicStore } from "@/lib/useCivicStore";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, role, user, mounted, logout } = useCivicStore();

  const roleRouteMap: Record<string, string> = {
    citizen: "/dashboard",
    officer: "/officer",
    worker: "/worker",
    admin: "/admin",
    dept_admin: "/analytics",
  };

  const targetPortal = roleRouteMap[role] || "/dashboard";

  return (
    <AuthLayout>
      {/* If already authenticated, offer instant continuation or re-login */}
      {mounted && isAuthenticated && (
        <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold">Active Session: {user.name}</p>
              <p className="text-[11px] text-blue-700 capitalize">
                Role: {role.replace("_", " ")} • Destination: {targetPortal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push(targetPortal)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1"
            >
              <span>Go to Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-500 transition"
              title="Sign Out / Switch User"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Role-Based Login Form */}
      <LoginForm />
    </AuthLayout>
  );
}