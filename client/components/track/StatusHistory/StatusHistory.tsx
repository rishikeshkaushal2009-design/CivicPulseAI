"use client";

type HistoryItem = {
  status: string;
  message: string;
  timestamp: string;
};

type StatusHistoryProps = {
  history: HistoryItem[];
};

const statusConfig: Record<
  string,
  {
    icon: string;
    color: string;
    bg: string;
  }
> = {
  Submitted: {
    icon: "✓",
    color: "text-slate-300",
    bg: "bg-slate-700",
  },

  "Under Review": {
    icon: "🔍",
    color: "text-blue-400",
    bg: "bg-blue-600",
  },

  "In Progress": {
    icon: "🔧",
    color: "text-yellow-400",
    bg: "bg-yellow-500",
  },

  Resolved: {
    icon: "✓",
    color: "text-green-400",
    bg: "bg-green-500",
  },
};

export default function StatusHistory({
  history,
}: StatusHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          📜 Complaint History
        </h2>

        <p className="mt-2 text-slate-400">
          Track every status update made to your complaint.
        </p>
      </div>

      <div className="relative">
        {history.map((item, index) => {
          const config =
            statusConfig[item.status] || statusConfig.Submitted;

          const isLast = index === history.length - 1;

          return (
            <div
              key={`${item.status}-${item.timestamp}-${index}`}
              className="relative flex gap-5 pb-8 last:pb-0"
            >
              {!isLast && (
                <div className="absolute left-5 top-10 h-full w-px bg-slate-700" />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} font-bold text-white`}
              >
                {config.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className={`text-lg font-bold ${config.color}`}>
                    {item.status}
                  </h3>

                  <span className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}