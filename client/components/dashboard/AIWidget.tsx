import { Bot, Sparkles } from "lucide-react";

export default function AIWidget() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-blue-600 p-3">
          <Bot className="h-8 w-8 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            CivicPulse AI
          </h2>

          <p className="text-slate-400">
            Smart Civic Assistant
          </p>
        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-slate-900/60 p-5">

        <div className="flex gap-3">

          <Sparkles className="mt-1 text-blue-400" />

          <p className="text-slate-300">
            Good morning! I found <span className="font-bold text-red-400">3 urgent complaints</span> near your location.

            Would you like me to prioritize them?
          </p>

        </div>

      </div>

      <button
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Open AI Assistant
      </button>

    </div>
  );
}