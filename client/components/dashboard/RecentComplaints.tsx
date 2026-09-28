"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type Complaint = {
  id: string;

  userId?: string;

  citizenId?: string;

  citizenEmail?: string;

  citizenName?: string;

  title: string;

  description?: string;

  category?: string;

  priority?: string;

  department?: string;

  status: string;

  createdAt?: string;

  updatedAt?: string;
};

export default function RecentComplaints() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ==========================================
   * LOAD CITIZEN COMPLAINTS FROM FIRESTORE
   * ==========================================
   */

  const loadComplaints = async (
    uid: string
  ) => {
    setLoading(true);
    setError("");

    try {
      /*
       * ======================================
       * FIRESTORE QUERY
       * ======================================
       *
       * Get complaints belonging to the
       * currently logged-in citizen.
       */

      const complaintsRef =
        collection(db, "complaints");

      const complaintsQuery = query(
        complaintsRef,

        where("userId", "==", uid),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(5)
      );

      const snapshot =
        await getDocs(
          complaintsQuery
        );

      /*
       * ======================================
       * CONVERT FIRESTORE DOCUMENTS
       * ======================================
       */

      const firebaseComplaints: Complaint[] =
        snapshot.docs.map(
          (document) => {
            const data =
              document.data();

            return {
              id:
                data.id ||
                document.id,

              userId:
                data.userId,

              citizenId:
                data.citizenId,

              citizenEmail:
                data.citizenEmail,

              citizenName:
                data.citizenName,

              title:
                data.title ||
                "Untitled Complaint",

              description:
                data.description,

              category:
                data.category,

              priority:
                data.priority,

              department:
                data.department,

              status:
                data.status ||
                "Submitted",

              createdAt:
                data.createdAt,

              updatedAt:
                data.updatedAt,
            };
          }
        );

      setComplaints(
        firebaseComplaints
      );

      /*
       * ======================================
       * OPTIONAL LOCAL STORAGE SYNC
       * ======================================
       *
       * Keep localStorage synchronized so
       * existing CivicPulse components that
       * still use it don't suddenly break.
       */

      try {
        localStorage.setItem(
          "civicpulse_complaints",
          JSON.stringify(
            firebaseComplaints
          )
        );
      } catch {
        // Ignore localStorage errors.
      }
    } catch (error: any) {
      console.error(
        "Firestore complaints error:",
        error
      );

      /*
       * ======================================
       * FIRESTORE INDEX ERROR
       * ======================================
       *
       * Firestore may initially request an
       * index for the userId + createdAt query.
       */

      if (
        error?.code ===
        "failed-precondition"
      ) {
        setError(
          "Firestore needs an index for this complaint query. Open the Firebase Console link shown in your browser console to create it."
        );
      }

      /*
       * ======================================
       * PERMISSION ERROR
       * ======================================
       */

      else if (
        error?.code ===
        "permission-denied"
      ) {
        setError(
          "You don't have permission to view these complaints."
        );
      }

      /*
       * ======================================
       * NETWORK ERROR
       * ======================================
       */

      else if (
        error?.code ===
        "unavailable"
      ) {
        setError(
          "Unable to connect to Firebase. Please check your internet connection."
        );
      }

      /*
       * ======================================
       * OTHER ERROR
       * ======================================
       */

      else {
        setError(
          "Unable to load your complaints. Please try again."
        );
      }

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * AUTH LISTENER
   * ==========================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setComplaints([]);
            setLoading(false);
            return;
          }

          loadComplaints(
            user.uid
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /*
   * ==========================================
   * CIVICPULSE UPDATE EVENT
   * ==========================================
   */

  useEffect(() => {
    const refresh = () => {
      const user =
        auth.currentUser;

      if (user) {
        loadComplaints(
          user.uid
        );
      }
    };

    window.addEventListener(
      "civicpulse-updated",
      refresh
    );

    return () => {
      window.removeEventListener(
        "civicpulse-updated",
        refresh
      );
    };
  }, []);

  /*
   * ==========================================
   * STATUS STYLE
   * ==========================================
   */

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "Submitted":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "Under Review":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "Assigned":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "Resolved":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  /*
   * ==========================================
   * PRIORITY STYLE
   * ==========================================
   */

  const getPriorityStyle = (
    priority: string
  ) => {
    const value =
      priority.toLowerCase();

    if (
      value.includes("high") ||
      value.includes("critical")
    ) {
      return "text-red-400";
    }

    if (
      value.includes("medium")
    ) {
      return "text-orange-400";
    }

    return "text-green-400";
  };

  /*
   * ==========================================
   * DATE
   * ==========================================
   */

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            📋 My Complaints
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your recently submitted civic issues.
          </p>

        </div>

        <Link
          href="/track"
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20"
        >
          View All →
        </Link>

      </div>

      {/* ======================================
          ERROR
      ======================================= */}

      {error && (

        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

          <p className="text-sm text-red-400">
            ⚠️ {error}
          </p>

        </div>

      )}

      {/* ======================================
          LOADING
      ======================================= */}

      {loading ? (

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">

          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="text-slate-500">
            Loading your complaints...
          </p>

        </div>

      ) : complaints.length === 0 ? (

        /* ====================================
           EMPTY STATE
        ===================================== */

        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-10 text-center">

          <div className="text-5xl">
            📋
          </div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            No complaints yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You haven't registered any civic
            complaints. Once you submit one,
            it will appear here.
          </p>

          <Link
            href="/report"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            📝 Register Complaint
          </Link>

        </div>

      ) : (

        /* ====================================
           COMPLAINT TABLE
        ===================================== */

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px] text-left">

            <thead>

              <tr className="border-b border-slate-800">

                <th className="pb-4 pr-4 text-sm font-medium text-slate-500">
                  Complaint ID
                </th>

                <th className="pb-4 pr-4 text-sm font-medium text-slate-500">
                  Issue
                </th>

                <th className="pb-4 pr-4 text-sm font-medium text-slate-500">
                  Department
                </th>

                <th className="pb-4 pr-4 text-sm font-medium text-slate-500">
                  Status
                </th>

                <th className="pb-4 pr-4 text-sm font-medium text-slate-500">
                  Priority
                </th>

                <th className="pb-4 text-sm font-medium text-slate-500">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {complaints.map(
                (complaint) => (

                  <tr
                    key={complaint.id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-950/60"
                  >

                    {/* ID */}

                    <td className="py-5 pr-4">

                      <Link
                        href={`/track?id=${complaint.id}`}
                        className="font-semibold text-blue-400 hover:text-blue-300"
                      >
                        {complaint.id}
                      </Link>

                    </td>

                    {/* ISSUE */}

                    <td className="py-5 pr-4">

                      <p className="font-medium text-white">
                        {complaint.title}
                      </p>

                      {complaint.category && (

                        <p className="mt-1 text-xs text-slate-500">
                          {complaint.category}
                        </p>

                      )}

                    </td>

                    {/* DEPARTMENT */}

                    <td className="py-5 pr-4 text-sm text-slate-400">

                      {complaint.department ||
                        "Under Review"}

                    </td>

                    {/* STATUS */}

                    <td className="py-5 pr-4">

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                    </td>

                    {/* PRIORITY */}

                    <td
                      className={`py-5 pr-4 text-sm font-semibold ${getPriorityStyle(
                        complaint.priority || ""
                      )}`}
                    >
                      {complaint.priority ||
                        "Normal"}
                    </td>

                    {/* DATE */}

                    <td className="py-5 text-sm text-slate-500">

                      {formatDate(
                        complaint.createdAt
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}