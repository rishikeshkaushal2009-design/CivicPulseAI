"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AIAnalysisCard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);

    // Temporary demo analysis.
    // Later this will call our backend AI API.
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  return (
    <div className="rounded-3xl border border-blue-800/60 bg-linear-to-br from-blue-950/40 to-purple-950/30 p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-3">
            <Bot className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              CivicPulse AI Analysis
            </h2>

            <p className="mt-1 text-slate-400">
              AI will analyze your complaint and recommend priority.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Analyze Complaint
            </>
          )}
        </button>
      </div>

      {!analyzed && !analyzing && (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="flex gap-4">
            <Sparkles className="mt-1 h-5 w-5 text-blue-400" />

            <div>
              <p className="font-medium text-white">
                Ready for AI analysis
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Click "Analyze Complaint" to generate an AI-powered
                category, priority, severity, and department recommendation.
              </p>
            </div>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="mt-8 rounded-2xl border border-blue-800/50 bg-slate-950/70 p-6">
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />

            <div>
              <p className="font-medium text-white">
                CivicPulse AI is analyzing...
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Checking issue type, severity, priority, and department.
              </p>
            </div>
          </div>
        </div>
      )}

      {analyzed && (
        <div className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalysisItem
              label="Category"
              value="Road Damage"
              type="info"
            />

            <AnalysisItem
              label="Priority"
              value="High"
              type="danger"
            />

            <AnalysisItem
              label="Severity"
              value="7 / 10"
              type="warning"
            />

            <AnalysisItem
              label="Department"
              value="Roads"
              type="success"
            />
          </div>

          <div className="rounded-2xl border border-green-800/50 bg-green-950/20 p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-400" />

              <div>
                <p className="font-semibold text-white">
                  AI Recommendation
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  This complaint appears to require prompt attention.
                  The issue has been classified as a high-priority road
                  maintenance problem.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-800/50 bg-yellow-950/20 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-yellow-400" />

              <div>
                <p className="font-semibold text-white">
                  AI Confidence
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  92% confidence in the generated classification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisItem({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "info" | "danger" | "warning" | "success";
}) {
  const styles = {
    info: "border-blue-800/50 bg-blue-950/30 text-blue-400",
    danger: "border-red-800/50 bg-red-950/30 text-red-400",
    warning: "border-yellow-800/50 bg-yellow-950/30 text-yellow-400",
    success: "border-green-800/50 bg-green-950/30 text-green-400",
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[type]}`}>
      <p className="text-sm opacity-80">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}