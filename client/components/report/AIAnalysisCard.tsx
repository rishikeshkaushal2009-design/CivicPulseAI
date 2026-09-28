"use client";

type AIAnalysis = {
  category: string;
  priority: string;
  summary: string;
  reason: string;
  department: string;
};

type AIAnalysisCardProps = {
  analysis: AIAnalysis | null;
  analyzing: boolean;
};

export default function AIAnalysisCard({
  analysis,
  analyzing,
}: AIAnalysisCardProps) {
  return (
    <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-purple-950/50 p-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
          🤖
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            CivicPulse AI Analysis
          </h2>

          <p className="text-sm text-slate-400">
            AI-powered complaint classification and prioritization
          </p>
        </div>
      </div>

      {/* Loading */}
      {analyzing && (
        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-slate-950/60 p-6">
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />

            <div>
              <p className="font-semibold text-white">
                CivicPulse AI is analyzing your complaint...
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Identifying category, severity and responsible department.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No analysis yet */}
      {!analyzing && !analysis && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
          <div className="text-4xl">✨</div>

          <h3 className="mt-4 text-lg font-semibold text-white">
            Ready for AI Analysis
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Describe your civic issue and click
            {" "}
            <span className="text-blue-400">
              Analyze Complaint with AI
            </span>
            .
          </p>
        </div>
      )}

      {/* Analysis Result */}
      {!analyzing && analysis && (
        <div className="mt-8 space-y-5">

          {/* Category + Priority */}
          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="mt-2 text-xl font-bold text-blue-400">
                🏷️ {analysis.category}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-500">
                Priority
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  analysis.priority === "Critical"
                    ? "text-red-500"
                    : analysis.priority === "High"
                    ? "text-orange-400"
                    : analysis.priority === "Medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                🚨 {analysis.priority}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-500">
              AI Summary
            </p>

            <p className="mt-2 text-white">
              {analysis.summary}
            </p>
          </div>

          {/* Reason */}
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-500">
              Priority Reason
            </p>

            <p className="mt-2 text-slate-300">
              {analysis.reason}
            </p>
          </div>

          {/* Department */}
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-sm text-slate-500">
              Recommended Department
            </p>

            <p className="mt-2 text-lg font-semibold text-green-400">
              🏢 {analysis.department}
            </p>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Analysis completed successfully by CivicPulse AI
          </div>
        </div>
      )}
    </div>
  );
}