"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-xl">

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
            type="password"
            placeholder="••••••••"
            className="w-full bg-transparent py-4 text-white outline-none"
          />
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

        {/* Login Button */}

        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700">
          Login

          <ArrowRight size={18} />
        </button>

        {/* Divider */}

        <div className="my-8 flex items-center">

          <div className="h-px flex-1 bg-slate-700" />

          <span className="mx-3 text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-700" />

        </div>

        {/* Google */}

        <button className="w-full rounded-xl border border-slate-700 py-4 text-white transition hover:bg-slate-800">
          Continue with Google
        </button>

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

    </main>
  );
}