import Link from "next/link";
import {
  AlertTriangle,
  Map,
  ClipboardList,
  Bot,
} from "lucide-react";

const actions = [
  {
    title: "Report Issue",
    desc: "Submit a new complaint",
    icon: AlertTriangle,
    href: "/report",
    color: "from-red-500 to-red-700",
  },
  {
    title: "Explore Map",
    desc: "View nearby civic issues",
    icon: Map,
    href: "/map",
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "My Complaints",
    desc: "Track submitted reports",
    icon: ClipboardList,
    href: "/track",
    color: "from-green-500 to-green-700",
  },
  {
    title: "AI Copilot",
    desc: "Ask CivicPulse AI",
    icon: Bot,
    href: "#",
    color: "from-purple-500 to-purple-700",
  },
];

export default function QuickActions() {
  return (
    <section className="mt-10">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`rounded-2xl bg-gradient-to-br ${action.color} p-6 transition duration-300 hover:scale-105`}
            >
              <Icon className="mb-6 h-10 w-10 text-white" />

              <h3 className="text-xl font-bold text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-slate-100">
                {action.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}