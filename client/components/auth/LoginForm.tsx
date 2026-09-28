"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
  CheckCircle2,
  Mail,
  UserPlus,
} from "lucide-react";
import { loginRealUser } from "@/lib/authService";
import { UserRole } from "@/types/civic";

const ROLE_ROUTE_MAP: Record<UserRole, string> = {
  citizen: "/dashboard",
  officer: "/officer",
  worker: "/worker",
  admin: "/admin",
  dept_admin: "/analytics",
};

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError("Please enter both your email address (or username) and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginRealUser(cleanUser, cleanPass);

      if (!res.success || !res.user) {
        setError(res.error || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      const user = res.user;
      const targetRoute = ROLE_ROUTE_MAP[user.role] || "/dashboard";

      setAuthSuccess(`Access Granted as ${user.name} (${user.role.toUpperCase()})! Redirecting to portal...`);

      setTimeout(() => {
        router.push(targetRoute);
      }, 500);
    } catch (err: any) {
      setError(err?.message || "An error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto border border-slate-200 shadow-md shadow-slate-900/10 bg-slate-950 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="CivicPulse Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to <span className="text-blue-600">CivicPulse AI</span>
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your registered email address and password to authenticate into your municipal portal
        </p>
      </div>

      {/* REAL LOGIN FORM */}
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-in fade-in">
            ⚠️ {error}
          </div>
        )}

        {authSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Email or Username */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Email Address or Username
          </label>
          <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
            <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your registered email or username"
              className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
            <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 ml-1.5 focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember active session</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !!authSuccess}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-3 cursor-pointer"
        >
          {loading ? (
            "Authenticating..."
          ) : authSuccess ? (
            "Signing In..."
          ) : (
            <>
              <span>Sign In to CivicPulse AI</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Registration CTA */}
      <div className="pt-4 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-600">
          Don&apos;t have an account yet?
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-600" />
          <span>Register New Account (All Roles)</span>
        </Link>
      </div>
    </div>
  );
}