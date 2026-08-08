"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock3,
  Building2,
} from "lucide-react";

const stats = [
  {
    icon: FileText,
    value: 125,
    suffix: "K+",
    label: "Complaints Reported",
    color: "text-blue-500",
  },
  {
    icon: CheckCircle,
    value: 98,
    suffix: "K+",
    label: "Issues Resolved",
    color: "text-green-500",
  },
  {
    icon: Clock3,
    value: 18,
    suffix: " hrs",
    label: "Average Resolution",
    color: "text-yellow-500",
  },
  {
    icon: Building2,
    value: 92,
    suffix: "%",
    label: "City Health Score",
    color: "text-purple-500",
  },
];

export default function Statistics() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
            >
              <Icon className={`mb-6 h-10 w-10 ${stat.color}`} />

              <h2 className="text-4xl font-bold text-white">
                <CountUp
                  end={stat.value}
                  duration={2}
                />
                {stat.suffix}
              </h2>

              <p className="mt-3 text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}