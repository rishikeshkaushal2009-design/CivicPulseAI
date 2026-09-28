"use client";

type HistoryItem = {
  status: string;
  message: string;
  timestamp: string;
};

type StatusHistoryProps = {
  history: HistoryItem[];
};

export default function StatusHistory({
  history,
}: StatusHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold text-white">
          🕒 Status History
        </h2>

        <p className="mt-4 text-slate-500">
          No status history available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold text-white">
        🕒 Status History
      </h2>

      <p className="mt-2 text-slate-400">
        Timeline of updates to your complaint.
      </p>

      <div className="mt-8 space-y-6">
        {history.map((item, index) => (
          <div
            key={`${item.status}-${item.timestamp}-${index}`}
            className="relative flex gap-5"
          >
            {/* Timeline line */}
            {index < history.length - 1 && (
              <div className="absolute left-5 top-10 h-full w-0.5 bg-slate-700" />
            )}

            {/* Circle */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              ✓
            </div>

            {/* Content */}
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold text-blue-400">
                  {item.status}
                </h3>

                <span className="text-xs text-slate-500">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 text-slate-300">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}