export default function TrackPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          📍 Track Complaint
        </h1>

        <p className="mt-3 text-slate-400">
          Track the status of your submitted civic complaints.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Enter Complaint ID"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none focus:border-blue-500"
            />

            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
            >
              Track Complaint
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-8 text-center">
            <p className="text-slate-400">
              Enter a complaint ID to view its status.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}