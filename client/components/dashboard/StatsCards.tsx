"use client";

import { useEffect, useState } from "react";

type Complaint = {
  id: string;
  priority?: string;
  status?: string;
};

export default function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
  });

  const loadStats = () => {
    try {
      const complaints: Complaint[] = JSON.parse(
        localStorage.getItem("civicpulse_complaints") || "[]"
      );

      setStats({
        total: complaints.length,

        highPriority: complaints.filter(
          (complaint) =>
            complaint.priority?.toLowerCase() === "high"
        ).length,

        underReview: complaints.filter(
          (complaint) =>
            complaint.status?.toLowerCase() === "under review"
        ).length,

        inProgress: complaints.filter(
          (complaint) =>
            complaint.status?.toLowerCase() === "in progress"
        ).length,

        resolved: complaints.filter(
          (complaint) =>
            complaint.status?.toLowerCase() === "resolved"
        ).length,
      });
    } catch (error) {
      console.error("Failed to load complaint statistics:", error);
    }
  };

  useEffect(() => {
    loadStats();

    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(loadStats, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const cards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: "📋",
      description: "All submitted complaints",
    },
    {
      title: "High Priority",
      value: stats.highPriority,
      icon: "🚨",
      description: "Require urgent attention",
    },
    {
      title: "Under Review",
      value: stats.underReview,
      icon: "🔍",
      description: "Currently being reviewed",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: "🔧",
      description: "Work is currently underway",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: "✅",
      description: "Successfully resolved",
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-blue-500/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                {card.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {card.value}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
              {card.icon}
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {card.description}
          </p>
        </div>
      ))}
    </section>
  );
}