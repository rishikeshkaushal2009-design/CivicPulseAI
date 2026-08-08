const activities = [
  {
    title: "Complaint #CP001 Submitted",
    description: "Pothole reported on MG Road",
    time: "2 mins ago",
    color: "bg-blue-500",
  },
  {
    title: "Complaint Assigned",
    description: "Worker assigned by Municipal Officer",
    time: "15 mins ago",
    color: "bg-yellow-500",
  },
  {
    title: "Issue Resolved",
    description: "Streetlight repaired successfully",
    time: "1 hour ago",
    color: "bg-green-500",
  },
  {
    title: "AI Priority Updated",
    description: "Garbage complaint marked as High Priority",
    time: "Today",
    color: "bg-purple-500",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-8 text-2xl font-bold text-white">
        📈 Activity Timeline
      </h2>

      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-4 w-4 rounded-full ${item.color}`} />
              <div className="h-full w-px bg-slate-700" />
            </div>

            <div className="pb-6">
              <h3 className="font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-slate-400">
                {item.description}
              </p>

              <span className="mt-2 block text-sm text-slate-500">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}