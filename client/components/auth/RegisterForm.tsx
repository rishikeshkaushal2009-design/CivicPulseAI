"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserRound,
  Building2,
  Wrench,
} from "lucide-react";

import SocialLogin from "./SocialLogin";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("citizen");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">
          CivicPulse
          <span className="text-blue-500"> AI</span>
        </h1>

        <p className="mt-3 text-slate-400">
          Create your account
        </p>
      </div>

      {/* Full Name */}
      <label className="mb-2 block text-sm text-slate-300">
        Full Name
      </label>

      <div className="mb-4 flex items-center rounded-xl border border-slate-700 px-4">
        <User className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type="text"
          placeholder="John Doe"
          className="w-full bg-transparent py-4 text-white outline-none"
        />
      </div>

      {/* Email */}
      <label className="mb-2 block text-sm text-slate-300">
        Email
      </label>

      <div className="mb-4 flex items-center rounded-xl border border-slate-700 px-4">
        <Mail className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full bg-transparent py-4 text-white outline-none"
        />
      </div>

      {/* Phone */}
      <label className="mb-2 block text-sm text-slate-300">
        Phone Number
      </label>

      <div className="mb-4 flex items-center rounded-xl border border-slate-700 px-4">
        <Phone className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type="tel"
          placeholder="+91 9876543210"
          className="w-full bg-transparent py-4 text-white outline-none"
        />
      </div>

      {/* Password */}
      <label className="mb-2 block text-sm text-slate-300">
        Password
      </label>

      <div className="mb-4 flex items-center rounded-xl border border-slate-700 px-4">
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

      {/* Confirm Password */}
      <label className="mb-2 block text-sm text-slate-300">
        Confirm Password
      </label>

      <div className="mb-6 flex items-center rounded-xl border border-slate-700 px-4">
        <Lock className="mr-3 h-5 w-5 text-slate-500" />

        <input
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          className="w-full bg-transparent py-4 text-white outline-none"
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? (
            <EyeOff className="text-slate-400" />
          ) : (
            <Eye className="text-slate-400" />
          )}
        </button>
      </div>

      {/* Role Selection */}

<h3 className="mb-4 text-sm font-medium text-slate-300">
  Select Your Role
</h3>

<div className="mb-6 grid grid-cols-3 gap-4">

  {/* Citizen */}

  <button
    type="button"
    onClick={() => setRole("citizen")}
    className={`rounded-2xl border p-4 text-center transition-all duration-300 ${
      role === "citizen"
        ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20"
        : "border-slate-700 hover:border-blue-400 hover:bg-slate-800"
    }`}
  >
    <UserRound className="mx-auto mb-3 h-8 w-8 text-blue-400" />

    <h4 className="font-semibold text-white">
      Citizen
    </h4>

    <p className="mt-2 text-xs text-slate-400">
      Report civic issues
    </p>
  </button>

  {/* Officer */}

  <button
    type="button"
    onClick={() => setRole("officer")}
    className={`rounded-2xl border p-4 text-center transition-all duration-300 ${
      role === "officer"
        ? "border-green-500 bg-green-600/20 shadow-lg shadow-green-500/20"
        : "border-slate-700 hover:border-green-400 hover:bg-slate-800"
    }`}
  >
    <Building2 className="mx-auto mb-3 h-8 w-8 text-green-400" />

    <h4 className="font-semibold text-white">
      Officer
    </h4>

    <p className="mt-2 text-xs text-slate-400">
      Manage complaints
    </p>
  </button>

  {/* Worker */}

  <button
    type="button"
    onClick={() => setRole("worker")}
    className={`rounded-2xl border p-4 text-center transition-all duration-300 ${
      role === "worker"
        ? "border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/20"
        : "border-slate-700 hover:border-yellow-400 hover:bg-slate-800"
    }`}
  >
    <Wrench className="mx-auto mb-3 h-8 w-8 text-yellow-400" />

    <h4 className="font-semibold text-white">
      Worker
    </h4>

    <p className="mt-2 text-xs text-slate-400">
      Resolve issues
    </p>
  </button>

</div>
      {/* Register Button */}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700 transition">
        Register
        <ArrowRight size={18} />
      </button>

      <SocialLogin />

      <p className="mt-8 text-center text-slate-400">
        Already have an account?

        <Link
          href="/login"
          className="ml-2 text-blue-400"
        >
          Login
        </Link>
      </p>

    </div>
  );
}