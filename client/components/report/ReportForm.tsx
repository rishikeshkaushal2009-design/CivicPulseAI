"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import CategorySelector from "./CategorySelector";
import LocationPicker from "./LocationPicker";
import AIAnalysisCard from "./AIAnalysisCard";
import SubmitSection from "./SubmitSection";

type Location = {
  latitude: number;
  longitude: number;
};

type AIAnalysis = {
  category: string;
  priority: string;
  summary: string;
  reason: string;
  department: string;
};

export default function ReportForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [location, setLocation] =
    useState<Location | null>(null);

  const [analysis, setAnalysis] =
    useState<AIAnalysis | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ================================
   * AI ANALYSIS
   * ================================
   */

  const analyzeComplaint = async () => {
    if (!title.trim()) {
      alert("Please enter a complaint title.");
      return;
    }

    if (!description.trim()) {
      alert("Please describe the civic issue.");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            description: description.trim(),
            location: location
              ? `${location.latitude}, ${location.longitude}`
              : "Location not selected",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "AI analysis failed."
        );
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error(
        "AI Analysis Error:",
        error
      );

      setError(
        "Unable to connect to CivicPulse AI. Make sure the backend server is running on port 5000."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ================================
          HEADER
      ================================= */}

      <div>

        <div className="mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
          🤖 AI Powered Civic Intelligence
        </div>

        <h1 className="text-4xl font-bold text-white md:text-5xl">
          🚨 Report New Civic Issue
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-400">
          Upload an image or describe your issue.
          CivicPulse AI will automatically classify,
          prioritize, and route the complaint.
        </p>

      </div>

      {/* ================================
          IMAGE
      ================================= */}

      <ImageUploader />

      {/* ================================
          COMPLAINT DETAILS
      ================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">

        <h2 className="mb-6 text-2xl font-bold text-white">
          📝 Complaint Details
        </h2>

        <div className="space-y-6">

          {/* TITLE */}

          <div>

            <label
              htmlFor="complaint-title"
              className="mb-2 block font-medium text-slate-300"
            >
              Complaint Title
            </label>

            <input
              id="complaint-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setAnalysis(null);
              }}
              placeholder="Example: Large pothole near university gate"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <label
              htmlFor="complaint-description"
              className="mb-2 block font-medium text-slate-300"
            >
              Description
            </label>

            <textarea
              id="complaint-description"
              rows={6}
              value={description}
              onChange={(event) => {
                setDescription(
                  event.target.value
                );
                setAnalysis(null);
              }}
              placeholder="Describe what happened, where it happened, and any details that may help the authorities..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {description.length} characters
            </p>

          </div>

        </div>

      </div>

      {/* ================================
          CATEGORY
      ================================= */}

      <CategorySelector />

      {/* ================================
          LOCATION
      ================================= */}

      <LocationPicker
        location={location}
        onLocationChange={setLocation}
      />

      {/* ================================
          AI BUTTON
      ================================= */}

      <div className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-8">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-2xl font-bold text-white">
              🤖 Analyze Complaint
            </h2>

            <p className="mt-2 text-slate-400">
              Let CivicPulse AI classify the complaint,
              determine its priority, and recommend the
              responsible department.
            </p>

          </div>

          <button
            type="button"
            onClick={analyzeComplaint}
            disabled={analyzing}
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing
              ? "⏳ Analyzing..."
              : "🤖 Analyze with AI"}
          </button>

        </div>

        {error && (

          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm text-red-400">
              ⚠️ {error}
            </p>

          </div>

        )}

      </div>

      {/* ================================
          AI ANALYSIS RESULT
      ================================= */}

      <AIAnalysisCard
        analysis={analysis}
        analyzing={analyzing}
      />

      {/* ================================
          SUBMIT
      ================================= */}

      <SubmitSection
        title={title}
        description={description}
        analysis={analysis}
        location={location}
      />

    </div>
  );
}