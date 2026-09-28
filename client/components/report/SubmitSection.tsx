"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type AIAnalysis = {
  category: string;
  priority: string;
  summary: string;
  reason: string;
  department: string;
};

type Location = {
  latitude: number;
  longitude: number;
};

type SubmitSectionProps = {
  title: string;
  description: string;
  analysis: AIAnalysis | null;
  location: Location | null;
};

export default function SubmitSection({
  title,
  description,
  analysis,
  location,
}: SubmitSectionProps) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // -----------------------------
    // Validate title
    // -----------------------------
    if (!title.trim()) {
      alert("Please enter a complaint title.");
      return;
    }

    // -----------------------------
    // Validate description
    // -----------------------------
    if (!description.trim()) {
      alert("Please describe the civic issue.");
      return;
    }

    // -----------------------------
    // Validate AI analysis
    // -----------------------------
    if (!analysis) {
      alert(
        "Please analyze the complaint with AI before submitting."
      );
      return;
    }

    // -----------------------------
    // Validate location
    // -----------------------------
    if (!location) {
      alert(
        "Please select your complaint location before submitting."
      );
      return;
    }

    // -----------------------------
    // Check Firebase authentication
    // -----------------------------
    const user = auth.currentUser;

    if (!user) {
      alert("Please login before submitting a complaint.");
      return;
    }

    setSubmitting(true);

    try {
      // -----------------------------
      // Generate CivicPulse ID
      // -----------------------------
      const complaintId = `CP-${Date.now()
        .toString()
        .slice(-8)}`;

      // -----------------------------
      // Creation time
      // -----------------------------
      const createdAt = new Date().toISOString();

      // -----------------------------
      // Initial status history
      // -----------------------------
      const initialHistory = [
        {
          status: "Submitted",
          message:
            "Complaint successfully registered and submitted to CivicPulse.",
          timestamp: createdAt,
        },
      ];

      // -----------------------------
      // Complaint object
      // -----------------------------
      const complaint = {
        id: complaintId,

        // Firebase user
        userId: user.uid,

        // Citizen information
        citizenEmail: user.email || "",
        citizenName:
          user.displayName || "CivicPulse Citizen",

        // Complaint information
        title: title.trim(),
        description: description.trim(),

        // AI analysis
        category: analysis.category,
        priority: analysis.priority,
        summary: analysis.summary,
        reason: analysis.reason,
        department: analysis.department,

        // Status
        status: "Submitted",

        // Dates
        createdAt,
        updatedAt: createdAt,

        // Location
        latitude: location.latitude,
        longitude: location.longitude,

        // History
        history: initialHistory,
      };

      // =================================================
      // SAVE TO FIRESTORE
      // =================================================

      const complaintRef = doc(
        db,
        "complaints",
        complaintId
      );

      await setDoc(complaintRef, complaint);

      console.log(
        "Complaint saved to Firestore:",
        complaintId
      );

      // =================================================
      // LOCAL STORAGE BACKUP
      // =================================================

      try {
        const existing = JSON.parse(
          localStorage.getItem(
            "civicpulse_complaints"
          ) || "[]"
        );

        const existingComplaints = Array.isArray(
          existing
        )
          ? existing
          : [];

        localStorage.setItem(
          "civicpulse_complaints",
          JSON.stringify([
            complaint,
            ...existingComplaints,
          ])
        );

        localStorage.setItem(
          `civicpulse_history_${complaintId}`,
          JSON.stringify(initialHistory)
        );
      } catch (storageError) {
        console.warn(
          "Local storage backup failed:",
          storageError
        );
      }

      // =================================================
      // CREATE LOCAL NOTIFICATION
      // =================================================

      try {
        const notification = {
          id: Date.now(),
          complaintId,

          title: `Complaint ${complaintId} submitted successfully`,

          message:
            "Your civic complaint has been registered and is now awaiting department review.",

          time: "Just now",
          type: "success",
          status: "Submitted",
          createdAt,
          userId: user.uid,
        };

        const existingNotifications =
          JSON.parse(
            localStorage.getItem(
              "civicpulse_notifications"
            ) || "[]"
          );

        const notifications = Array.isArray(
          existingNotifications
        )
          ? existingNotifications
          : [];

        localStorage.setItem(
          "civicpulse_notifications",
          JSON.stringify([
            notification,
            ...notifications,
          ])
        );
      } catch (notificationError) {
        console.warn(
          "Notification save failed:",
          notificationError
        );
      }

      // =================================================
      // UPDATE DASHBOARD
      // =================================================

      window.dispatchEvent(
        new Event("civicpulse-updated")
      );

      // =================================================
      // GO TO TRACK PAGE
      // =================================================

      router.push(
        `/track?id=${complaintId}`
      );
    } catch (error: any) {
      console.error(
        "Complaint submission error:",
        error
      );

      if (
        error?.code === "permission-denied"
      ) {
        alert(
          "Firestore permission denied. Please check your Firebase rules."
        );
      } else {
        alert(
          "Unable to submit complaint. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-2xl">
            🚀
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Submit Complaint
            </h2>

            <p className="mt-1 text-slate-400">
              Submit your verified civic complaint to
              the appropriate department.
            </p>
          </div>

        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="mb-6 rounded-2xl border border-green-800/50 bg-green-950/20 p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-xl">
              ✓
            </div>

            <div>

              <p className="font-semibold text-green-400">
                AI Analysis Completed
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {analysis.category}
                {" • "}
                {analysis.priority} Priority
                {" • "}
                {analysis.department}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Location */}
      <div
        className={`mb-6 rounded-2xl border p-5 ${
          location
            ? "border-green-500/20 bg-green-500/5"
            : "border-yellow-500/20 bg-yellow-500/5"
        }`}
      >

        <div className="flex items-start gap-4">

          <div className="text-2xl">
            {location ? "📍" : "⚠️"}
          </div>

          <div>

            <p
              className={`font-semibold ${
                location
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {location
                ? "Complaint Location Selected"
                : "Complaint Location Required"}
            </p>

            {location ? (
              <p className="mt-1 text-sm text-slate-400">
                Latitude:{" "}
                {location.latitude.toFixed(6)}

                <br />

                Longitude:{" "}
                {location.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">
                Please select your location above.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* Complaint Information */}
      {analysis && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-500">
              AI Category
            </p>

            <p className="mt-2 font-bold text-blue-400">
              🏷️ {analysis.category}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-500">
              Priority
            </p>

            <p className="mt-2 font-bold text-orange-400">
              🚨 {analysis.priority}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-500">
              Department
            </p>

            <p className="mt-2 font-bold text-green-400">
              🏢 {analysis.department}
            </p>
          </div>

        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "⏳ Submitting Complaint..."
          : "🚀 Submit Complaint"}
      </button>

      {/* Information */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center">

        <p className="text-sm text-slate-500">
          Your complaint will receive a unique
          CivicPulse tracking ID.
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Your selected location will also be saved
          so the issue can appear on the CivicPulse map.
        </p>

      </div>

    </section>
  );
}