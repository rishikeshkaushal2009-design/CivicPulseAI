const complaints = [
  {
    id: "#CP001",
    issue: "Pothole on MG Road",
    status: "Pending",
    priority: "High",
  },
  {
    id: "#CP002",
    issue: "Broken Streetlight",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "#CP003",
    issue: "Garbage Overflow",
    status: "Resolved",
    priority: "Low",
  },
];

export default function RecentComplaints() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">
        📋 Recent Complaints
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-800">
            <tr>
              <th className="pb-3 text-slate-400">ID</th>
              <th className="pb-3 text-slate-400">Issue</th>
              <th className="pb-3 text-slate-400">Status</th>
              <th className="pb-3 text-slate-400">Priority</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-800"
              >
                <td className="py-4 text-white">{item.id}</td>
                <td className="py-4 text-white">{item.issue}</td>
                <td className="py-4 text-blue-400">{item.status}</td>
                <td className="py-4 text-red-400">{item.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}