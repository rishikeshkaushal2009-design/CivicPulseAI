"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-32 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm text-blue-300"
        >
          🤖 AI Powered Civic Intelligence
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl text-6xl font-bold leading-tight text-white md:text-8xl"
        >
          Your City.
          <br />
          <span className="text-blue-500">Your Voice.</span>
          <br />
          Smarter Solutions.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-3xl text-xl text-slate-400"
        >
          Report potholes, broken streetlights, drainage issues,
          garbage and more using AI-powered complaint analysis,
          real-time tracking and intelligent civic management.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-5"
        >
          <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700">
            🚨 Report an Issue
          </button>

          <button className="rounded-xl border border-slate-700 px-8 py-4 text-white transition hover:bg-slate-800">
            🗺️ Explore Civic Map
          </button>
        </motion.div>
      </div>
    </section>
  );
}