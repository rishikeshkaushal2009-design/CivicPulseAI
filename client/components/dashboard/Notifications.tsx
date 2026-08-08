const notifications = [
  {
    title: "Pothole reported near City Mall",
    time: "2 mins ago",
  },
  {
    title: "Streetlight fixed on MG Road",
    time: "18 mins ago",
  },
  {
    title: "Garbage complaint resolved",
    time: "1 hour ago",
  },
];

export default function Notifications() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">
        🔔 Notifications
      </h2>

      <div className="space-y-4">
        {notifications.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="text-white">
              {item.title}
            </p>

            <span className="text-sm text-slate-500">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}