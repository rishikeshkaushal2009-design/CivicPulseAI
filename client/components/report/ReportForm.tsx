"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import CategorySelector from "./CategorySelector";
import LocationPicker from "./LocationPicker";
import AIAnalysisCard from "./AIAnalysisCard";
import SubmitSection from "./SubmitSection";

export default function ReportForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-4 inline-flex rounded-full border border-blue-800 bg-blue-950/40 px-4 py-2 text-sm text-blue-300">
          🤖 AI Powered Civic Intelligence
        </div>

        <h1 className="text-4xl font-bold text-white md:text-5xl">
          🚨 Report New Civic Issue
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-400">
          Upload an image or describe your issue. CivicPulse AI will
          automatically classify, prioritize, and route the complaint.
        </p>
      </div>

      {/* Image */}
      <ImageUploader />

      {/* Complaint Details */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <h2 className="mb-6 text-2xl font-bold text-white">
          📝 Complaint Details
        </h2>

        <div className="space-y-6">
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Large pothole near university gate"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

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
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what happened, where it happened, and any details that may help the authorities..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {description.length} characters
            </p>
          </div>
        </div>
      </div>

      {/* Category */}
      <CategorySelector />

      {/* Location + Map */}
      <LocationPicker />

      {/* AI */}
      <AIAnalysisCard />

      {/* Submit */}
      <SubmitSection />
    </div>
  );
}