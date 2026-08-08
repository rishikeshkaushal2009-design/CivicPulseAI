export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">👤 My Profile</h1>

        <p className="mt-3 text-slate-400">
          Manage your CivicPulse account and personal information.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-semibold">
            Citizen Profile
          </h2>

          <p className="mt-4 text-slate-400">
            Profile settings will be available here.
          </p>
        </div>
      </div>
    </main>
  );
}