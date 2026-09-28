"use client";

import Link from "next/link";
import {
  Landmark,
  ArrowRight,
  IndianRupee,
  Building2,
} from "lucide-react";

const funds = [
  {
    title: "Swachh Bharat Mission",
    description:
      "Government initiative supporting sanitation, cleanliness and waste management projects.",
    amount: "₹1,250 Cr",
    projects: "120 Projects",
  },
  {
    title: "Smart Cities Mission",
    description:
      "Funding for smart infrastructure, digital services and urban development.",
    amount: "₹2,400 Cr",
    projects: "85 Projects",
  },
  {
    title: "AMRUT",
    description:
      "Public funding for water supply, drainage and urban infrastructure.",
    amount: "₹980 Cr",
    projects: "64 Projects",
  },
];

export default function GovernmentFunds() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10">
            <Landmark className="h-6 w-6 text-green-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Government Funds & Projects
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Explore public funding and civic development projects.
            </p>
          </div>

        </div>

        <Link
          href="/funds"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>

      </div>

      {/* Fund Cards */}
      <div className="grid gap-5 md:grid-cols-3">

        {funds.map((fund) => (

          <div
            key={fund.title}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-green-500/30"
          >

            <div className="mb-4 flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                Active
              </span>

            </div>

            <h3 className="text-lg font-bold text-white">
              {fund.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {fund.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-slate-900 p-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <IndianRupee className="h-3 w-3" />
                  Allocation
                </div>

                <p className="mt-1 font-semibold text-green-400">
                  {fund.amount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-3">
                <p className="text-xs text-slate-500">
                  Projects
                </p>

                <p className="mt-1 font-semibold text-blue-400">
                  {fund.projects}
                </p>
              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}