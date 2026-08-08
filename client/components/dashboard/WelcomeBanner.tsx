export default function WelcomeBanner() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
      <p className="text-blue-400 font-medium">
        👋 Good Morning
      </p>

      <h1 className="mt-2 text-5xl font-bold text-white">
        Rishikesh
      </h1>

      <p className="mt-4 max-w-2xl text-slate-400">
        Welcome back to CivicPulse AI.
        Report issues, monitor complaints, and help build a smarter city.
      </p>
    </section>
  );
}