import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import AIWidget from "@/components/dashboard/AIWidget";
import LiveMap from "@/components/dashboard/LiveMap";
import Notifications from "@/components/dashboard/Notifications";
import RecentComplaints from "@/components/dashboard/RecentComplaints";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <WelcomeBanner />

        <StatsCards />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>

          <AIWidget />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveMap />
          </div>

          <Notifications />
        </div>

        <RecentComplaints />

        <ActivityTimeline />

      </div>
    </main>
  );
}