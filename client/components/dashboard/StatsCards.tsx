import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Trophy,
} from "lucide-react";

const stats = [
  {
    title: "Open Complaints",
    value: "24",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    title: "Resolved",
    value: "118",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Nearby Issues",
    value: "9",
    icon: MapPin,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Civic Score",
    value: "94%",
    icon: Trophy,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

export default function StatsCards() {
  return (
    <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <div
              className={`mb-4 inline-flex rounded-xl p-3 ${item.bg}`}
            >
              <Icon className={`h-6 w-6 ${item.color}`} />
            </div>

            <h3 className="text-sm text-slate-400">
              {item.title}
            </h3>

            <p className="mt-2 text-4xl font-bold text-white">
              {item.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}