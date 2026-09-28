import Link from "next/link";
import {
  AlertTriangle,
  Map,
  ClipboardList,
  Bot,
  Siren,
  Wallet,
  MapPin,
} from "lucide-react";

const actions = [
  {
    title: "Emergency Complaint",
    desc: "Report an urgent civic situation",
    icon: Siren,
    href: "/emergency",
    color: "from-red-500 to-red-700",
  },
  {
    title: "Register Complaint",
    desc: "Report a civic problem",
    icon: AlertTriangle,
    href: "/report",
    color: "from-orange-500 to-orange-700",
  },
  {
    title: "My Complaints",
    desc: "View your submitted complaints",
    icon: ClipboardList,
    href: "/complaints",
    color: "from-green-500 to-green-700",
  },
  {
    title: "Track My Complaint",
    desc: "Track status and resolution",
    icon: MapPin,
    href: "/track",
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Explore Civic Map",
    desc: "View nearby civic issues",
    icon: Map,
    href: "/map",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    title: "Government Funds",
    desc: "Explore public funds and projects",
    icon: Wallet,
    href: "/funds",
    color: "from-emerald-500 to-emerald-700",
  },
];

export default function QuickActions() {
  return (
    <section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group rounded-2xl bg-gradient-to-br ${action.color} p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-white/80">
                {action.desc}
              </p>

              <div className="mt-5 text-sm font-semibold text-white/90">
                Open →
              </div>

            </Link>
          );
        })}

      </div>

    </section>
  );
}