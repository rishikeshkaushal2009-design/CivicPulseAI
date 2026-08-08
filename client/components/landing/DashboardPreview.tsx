"use client";

import { motion } from "framer-motion";
import {
  MapPinned,
  BrainCircuit,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-300">
            Smart AI Dashboard
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            AI Powered Civic Intelligence
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-slate-400">
            AI automatically classifies complaints, detects duplicates,
            assigns departments and prioritizes issues for faster action.
          </p>
        </motion.div>

        {/* Grid */}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left Map */}

          <motion.div
            whileHover={{ y: -8 }}
            className="col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <MapPinned className="text-blue-500" />
              <h3 className="text-xl font-semibold text-white">
                Live Civic Map
              </h3>
            </div>

            <div className="relative flex h-[350px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950">

              <div className="absolute left-20 top-16 rounded-xl bg-red-500 px-3 py-2 text-sm text-white shadow-lg">
                🔴 Pothole
              </div>

              <div className="absolute right-24 top-24 rounded-xl bg-yellow-500 px-3 py-2 text-sm text-black shadow-lg">
                🟠 Water Leak
              </div>

              <div className="absolute bottom-20 left-24 rounded-xl bg-green-600 px-3 py-2 text-sm text-white shadow-lg">
                🟢 Garbage
              </div>

              <div className="absolute bottom-16 right-20 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white shadow-lg">
                🔵 Streetlight
              </div>

              <MapPinned
                size={90}
                className="text-slate-700"
              />
            </div>
          </motion.div>

          {/* Right Side */}

          <div className="space-y-6">

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <BrainCircuit className="text-blue-500" />
                <h3 className="font-semibold text-white">
                  AI Analysis
                </h3>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <p>Category : Pothole</p>
                <p>Severity : High</p>
                <p>Department : Roads</p>
                <p>Confidence : 97%</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-500" />

                <div>
                  <p className="text-sm text-slate-400">
                    Civic Health
                  </p>

                  <h2 className="text-4xl font-bold text-white">
                    92%
                  </h2>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <Activity className="text-purple-500" />

                <h3 className="text-white">
                  Today's Activity
                </h3>
              </div>

              <div className="space-y-3 text-sm">

                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={16} />
                  42 Critical Complaints
                </div>

                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 size={16} />
                  138 Resolved
                </div>

                <div className="flex items-center gap-2 text-yellow-400">
                  <Lightbulb size={16} />
                  AI processed 826 reports
                </div>

              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}