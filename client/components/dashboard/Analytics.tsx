"use client";

import { useEffect, useState } from "react";

type Complaint = {
  id?: string;
  priority?: string;
  status?: string;
};

type Stats = {
  total: number;
  high: number;
  submitted: number;
  underReview: number;
  inProgress: number;
  resolved: number;
};

const EMPTY_STATS: Stats = {
  total: 0,
  high: 0,
  submitted: 0,
  underReview: 0,
  inProgress: 0,
  resolved: 0,
};

export default function Analytics() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loaded, setLoaded] = useState(false);

  const loadAnalytics = () => {
    try {
      const saved = localStorage.getItem("civicpulse_complaints");

      const complaints: Complaint[] = saved
        ? JSON.parse(saved)
        : [];

      if (!Array.isArray(complaints)) {
        setStats(EMPTY_STATS);
        setLoaded(true);
        return;
      }

      const total = complaints.length;

      const high = complaints.filter(
        (complaint) =>
          complaint.priority?.toLowerCase() === "high"
      ).length;

      const submitted = complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "submitted"
      ).length;

      const underReview = complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "under review"
      ).length;

      const inProgress = complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "in progress"
      ).length;

      const resolved = complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() === "resolved"
      ).length;

      setStats({
        total,
        high,
        submitted,
        underReview,
        inProgress,
        resolved,
      });

      setLoaded(true);
    } catch (error) {
      console.error("Analytics loading failed:", error);
      setStats(EMPTY_STATS);
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(loadAnalytics, 1000);

    window.addEventListener("storage", loadAnalytics);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadAnalytics);
    };
  }, []);

  if (!loaded) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-slate-400">
          Loading civic analytics...
        </p>
      </section>
    );
  }

  const resolutionRate =
    stats.total > 0
      ? Math.round((stats.resolved / stats.total) * 100)
      : 0;

  const highPriorityRate =
    stats.total > 0
      ? Math.round((stats.high / stats.total) * 100)
      : 0;

  const getWidth = (value: number) => {
    if (stats.total === 0) {
      return "0%";
    }

    return `${Math.round(
      (value / stats.total) * 100
    )}%`;
  };

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8">

      {/* HEADER */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          📊 Civic Intelligence
        </div>

        <h2 className="mt-4 text-3xl font-bold text-white">
          Civic Analytics
        </h2>

        <p className="mt-2 text-slate-400">
          Real-time overview of complaints and resolution progress.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Resolution */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
          <p className="text-sm text-slate-400">
            Resolution Rate
          </p>

          <div className="mt-3">
            <span className="text-4xl font-bold text-green-400">
              {resolutionRate}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${resolutionRate}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {stats.resolved} of {stats.total} complaints resolved
          </p>
        </div>

        {/* High Priority */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm text-slate-400">
            High Priority
          </p>

          <div className="mt-3">
            <span className="text-4xl font-bold text-red-400">
              {stats.high}
            </span>

            <span className="ml-2 text-sm text-slate-500">
              complaints
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-500"
              style={{
                width: `${highPriorityRate}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {highPriorityRate}% of all complaints
          </p>
        </div>

        {/* Under Review */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <p className="text-sm text-slate-400">
            Under Review
          </p>

          <div className="mt-3">
            <span className="text-4xl font-bold text-blue-400">
              {stats.underReview}
            </span>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Complaints currently being reviewed
          </p>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <p className="text-sm text-slate-400">
            In Progress
          </p>

          <div className="mt-3">
            <span className="text-4xl font-bold text-yellow-400">
              {stats.inProgress}
            </span>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Complaints currently being worked on
          </p>
        </div>

      </div>

      {/* STATUS DISTRIBUTION */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">

        <h3 className="text-xl font-bold text-white">
          Complaint Status Distribution
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Current distribution of all submitted complaints.
        </p>

        <div className="mt-6 space-y-5">

          {/* SUBMITTED */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-300">
                Submitted
              </span>

              <span className="text-slate-500">
                {stats.submitted}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-slate-500 transition-all duration-500"
                style={{
                  width: getWidth(stats.submitted),
                }}
              />
            </div>
          </div>

          {/* UNDER REVIEW */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-blue-400">
                Under Review
              </span>

              <span className="text-slate-500">
                {stats.underReview}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: getWidth(stats.underReview),
                }}
              />
            </div>
          </div>

          {/* IN PROGRESS */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-yellow-400">
                In Progress
              </span>

              <span className="text-slate-500">
                {stats.inProgress}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                style={{
                  width: getWidth(stats.inProgress),
                }}
              />
            </div>
          </div>

          {/* RESOLVED */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-green-400">
                Resolved
              </span>

              <span className="text-slate-500">
                {stats.resolved}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: getWidth(stats.resolved),
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SUMMARY */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Total Reports
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Active Complaints
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-400">
            {stats.underReview + stats.inProgress}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Resolved Complaints
          </p>

          <p className="mt-2 text-3xl font-bold text-green-400">
            {stats.resolved}
          </p>
        </div>

      </div>

    </section>
  );
}