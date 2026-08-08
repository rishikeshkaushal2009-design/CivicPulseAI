"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import SocialLogin from "./SocialLogin";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">

      {/* Logo */}

      <div className="mb-8 text-center">

        <h1 className="text-4xl font-bold text-white">
          CivicPulse
          <span className="text-blue-500"> AI</span>
        </h1>

        <p className="mt-3 text-slate-400">
          Report. Track. Resolve.
        </p>

      </div>

      {/* Email */}

      <label className="mb-2 block text-sm text-slate-300">
        Email
      </label>

      <div className="mb-5 flex items-center rounded-xl border border-slate-700 px-4">

        <Mail className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full bg-transparent py-4 text-white outline-none"
        />

      </div>

      {/* Password */}

      <label className="mb-2 block text-sm text-slate-300">
        Password
      </label>

      <div className="mb-6 flex items-center rounded-xl border border-slate-700 px-4">

        <Lock className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          className="w-full bg-transparent py-4 text-white outline-none"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="text-slate-400" />
          ) : (
            <Eye className="text-slate-400" />
          )}
        </button>

      </div>

      {/* Remember */}

      <div className="mb-6 flex items-center justify-between text-sm">

        <label className="flex items-center gap-2 text-slate-400">
          <input type="checkbox" />
          Remember me
        </label>

        <Link
          href="#"
          className="text-blue-400 hover:text-blue-300"
        >
          Forgot Password?
        </Link>

      </div>

      {/* Login */}

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700">

        Login

        <ArrowRight size={18} />

      </button>

      {/* Google */}

      <SocialLogin />

      {/* Register */}

      <p className="mt-8 text-center text-slate-400">

        Don't have an account?

        <Link
          href="/register"
          className="ml-2 text-blue-400"
        >
          Register
        </Link>

      </p>

    </div>
  );
}