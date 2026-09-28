"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Complaint = {
  id: string;

  userId?: string;

  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;

  title: string;
  description: string;

  category: string;
  priority: string;

  summary?: string;
  reason?: string;

  department: string;

  status: string;

  createdAt: string;

  latitude?: number;
  longitude?: number;

  history?: any[];
};

const statuses = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
];

export default function AdminComplaints() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /*
   * ==========================================
   * LOAD COMPLAINTS FROM FIRESTORE
   * ==========================================
   */

  const loadComplaints = async () => {
    setLoaded(false);
    setError("");

    try {
      const complaintsRef =
        collection(db, "complaints");

      const complaintsQuery = query(
        complaintsRef,
        orderBy("createdAt", "desc")
      );

      const snapshot =
        await getDocs(complaintsQuery);

      const firebaseComplaints: Complaint[] =
        snapshot.docs.map((document) => {
          const data =
            document.data();

          return {
            id:
              data.id ||
              document.id,

            userId:
              data.userId,

            citizenName:
              data.citizenName,

            citizenEmail:
              data.citizenEmail,

            citizenPhone:
              data.citizenPhone,

            title:
              data.title || "",

            description:
              data.description || "",

            category:
              data.category || "Other",

            priority:
              data.priority || "Medium",

            summary:
              data.summary,

            reason:
              data.reason,

            department:
              data.department || "Unassigned",

            status:
              data.status || "Submitted",

            createdAt:
              data.createdAt ||
              new Date().toISOString(),

            latitude:
              data.latitude,

            longitude:
              data.longitude,

            history:
              Array.isArray(
                data.history
              )
                ? data.history
                : [],
          };
        });

      setComplaints(
        firebaseComplaints
      );
    } catch (error: any) {
      console.error(
        "Error loading complaints:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. Check your Firestore security rules."
        );
      } else {
        setError(
          "Unable to load complaints from Firebase."
        );
      }

      setComplaints([]);
    } finally {
      setLoaded(true);
    }
  };

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadComplaints();

    const refresh =
      () => {
        loadComplaints();
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
   * STATUS MESSAGE
   * ==========================================
   */

  const getStatusMessage = (
    status: string
  ) => {
    switch (status) {
      case "Submitted":
        return (
          "Your complaint has been successfully submitted and is awaiting review."
        );

      case "Under Review":
        return (
          "Your complaint is currently being reviewed by the responsible department."
        );

      case "Assigned":
        return (
          "Your complaint has been assigned to a field worker."
        );

      case "In Progress":
        return (
          "Work has started on resolving your civic issue."
        );

      case "Resolved":
        return (
          "Your civic complaint has been marked as resolved."
        );

      default:
        return (
          "Your complaint status has been updated."
        );
    }
  };

  /*
   * ==========================================
   * STATUS COLOR
   * ==========================================
   */

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "Resolved":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "In Progress":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";

      case "Assigned":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";

      case "Under Review":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-slate-600 bg-slate-800 text-slate-300";
    }
  };

  /*
   * ==========================================
   * UPDATE COMPLAINT STATUS
   * ==========================================
   */

  const updateStatus = async (
    complaintId: string,
    newStatus: string
  ) => {
    const complaint =
      complaints.find(
        (item) =>
          item.id === complaintId
      );

    if (!complaint) {
      return;
    }

    const oldStatus =
      complaint.status;

    /*
     * Prevent unnecessary update
     */

    if (
      oldStatus === newStatus
    ) {
      return;
    }

    setUpdatingId(
      complaintId
    );

    setError("");

    try {
      /*
       * ======================================
       * NEW HISTORY ENTRY
       * ======================================
       */

      const historyEntry = {
        status: newStatus,

        previousStatus:
          oldStatus,

        timestamp:
          new Date().toISOString(),

        message:
          getStatusMessage(
            newStatus
          ),
      };

      const existingHistory =
        Array.isArray(
          complaint.history
        )
          ? complaint.history
          : [];

      const updatedHistory = [
        ...existingHistory,
        historyEntry,
      ];

      /*
       * ======================================
       * UPDATE FIRESTORE COMPLAINT
       * ======================================
       */

      const complaintRef =
        doc(
          db,
          "complaints",
          complaintId
        );

      await updateDoc(
        complaintRef,
        {
          status:
            newStatus,

          history:
            updatedHistory,

          updatedAt:
            new Date().toISOString(),
        }
      );

      /*
       * ======================================
       * CREATE CITIZEN NOTIFICATION
       * ======================================
       */

      if (complaint.userId) {
        const notificationId =
          `NT-${Date.now()}`;

        const notification = {
          id:
            notificationId,

          userId:
            complaint.userId,

          complaintId:
            complaintId,

          title:
            `Complaint ${complaintId} updated`,

          message:
            getStatusMessage(
              newStatus
            ),

          status:
            newStatus,

          type:
            "status-update",

          createdAt:
            new Date().toISOString(),

          time:
            "Just now",
        };

        /*
         * Import setDoc dynamically
         * to keep the main imports clean.
         */

        const {
          setDoc,
        } = await import(
          "firebase/firestore"
        );

        await setDoc(
          doc(
            db,
            "notifications",
            notificationId
          ),
          notification
        );
      }

      /*
       * ======================================
       * UPDATE LOCAL UI
       * ======================================
       */

      setComplaints(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              complaintId
                ? {
                    ...item,

                    status:
                      newStatus,

                    history:
                      updatedHistory,
                  }
                : item
          )
      );

      /*
       * ======================================
       * CIVICPULSE UPDATE EVENT
       * ======================================
       */

      window.dispatchEvent(
        new Event(
          "civicpulse-updated"
        )
      );
    } catch (error: any) {
      console.error(
        "Status update error:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. Your Firestore rules may not allow officer updates yet."
        );
      } else {
        setError(
          "Unable to update complaint status."
        );
      }
    } finally {
      setUpdatingId(
        null
      );
    }
  };

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (!loaded) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <div className="flex items-center gap-3">

          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="text-slate-400">
            Loading complaints from
            CivicPulse...
          </p>

        </div>

      </section>
    );
  }

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

      {/* ====================================
          HEADER
      ===================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <div className="mb-2 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
            🛡️ Officer Control Center
          </div>

          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Complaint Management
          </h2>

          <p className="mt-2 text-slate-400">
            Review citizen complaints and
            manage their resolution status.
          </p>

        </div>

        <button
          type="button"
          onClick={loadComplaints}
          disabled={!loaded}
          className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          🔄 Refresh
        </button>

      </div>

      {/* ====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

          <p className="text-sm text-red-400">
            ⚠️ {error}
          </p>

        </div>

      )}

      {/* ====================================
          STATISTICS
      ===================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs text-slate-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {complaints.length}
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs text-slate-500">
            New
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-400">
            {
              complaints.filter(
                (c) =>
                  c.status ===
                  "Submitted"
              ).length
            }
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs text-slate-500">
            Review
          </p>

          <p className="mt-1 text-2xl font-bold text-orange-400">
            {
              complaints.filter(
                (c) =>
                  c.status ===
                  "Under Review"
              ).length
            }
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs text-slate-500">
            In Progress
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-400">
            {
              complaints.filter(
                (c) =>
                  c.status ===
                  "In Progress"
              ).length
            }
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

          <p className="text-xs text-slate-500">
            Resolved
          </p>

          <p className="mt-1 text-2xl font-bold text-green-400">
            {
              complaints.filter(
                (c) =>
                  c.status ===
                  "Resolved"
              ).length
            }
          </p>

        </div>

      </div>

      {/* ====================================
          NO COMPLAINTS
      ===================================== */}

      {complaints.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

          <div className="text-4xl">
            📭
          </div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            No complaints found
          </h3>

          <p className="mt-2 text-slate-400">
            Citizen complaints submitted
            through CivicPulse will appear
            here.
          </p>

        </div>

      ) : (

        /* ==================================
           COMPLAINT LIST
        =================================== */

        <div className="space-y-5">

          {complaints.map(
            (complaint) => (

              <div
                key={
                  complaint.id
                }
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* =========================
                      COMPLAINT INFORMATION
                  ========================== */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="font-mono text-sm font-bold text-blue-400">
                        {complaint.id}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {complaint.priority}{" "}
                        Priority
                      </span>

                    </div>

                    <h3 className="mt-4 text-lg font-bold text-white">
                      {complaint.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {complaint.description}
                    </p>

                    {/* CITIZEN */}

                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">

                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Citizen
                      </p>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">

                        {complaint.citizenName && (
                          <span className="text-slate-300">
                            👤{" "}
                            {
                              complaint.citizenName
                            }
                          </span>
                        )}

                        {complaint.citizenEmail && (
                          <span className="text-slate-400">
                            ✉️{" "}
                            {
                              complaint.citizenEmail
                            }
                          </span>
                        )}

                        {complaint.citizenPhone && (
                          <span className="text-slate-400">
                            📱{" "}
                            {
                              complaint.citizenPhone
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">

                      <div className="rounded-xl bg-slate-900 p-3">

                        <p className="text-slate-600">
                          Category
                        </p>

                        <p className="mt-1 text-slate-300">
                          🏷️{" "}
                          {
                            complaint.category
                          }
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-900 p-3">

                        <p className="text-slate-600">
                          Department
                        </p>

                        <p className="mt-1 text-slate-300">
                          🏢{" "}
                          {
                            complaint.department
                          }
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-900 p-3">

                        <p className="text-slate-600">
                          Submitted
                        </p>

                        <p className="mt-1 text-slate-300">
                          📅{" "}
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </div>

                    {/* LOCATION */}

                    {typeof complaint.latitude ===
                      "number" &&
                      typeof complaint.longitude ===
                        "number" && (

                        <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">

                          <p className="text-xs text-slate-500">
                            📍 Complaint
                            Location
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {complaint.latitude.toFixed(
                              6
                            )}
                            ,{" "}
                            {complaint.longitude.toFixed(
                              6
                            )}
                          </p>

                        </div>

                      )}

                  </div>

                  {/* =========================
                      STATUS CONTROL
                  ========================== */}

                  <div className="w-full lg:w-64">

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Update Status
                    </label>

                    <select
                      value={
                        complaint.status
                      }
                      disabled={
                        updatingId ===
                        complaint.id
                      }
                      onChange={(
                        event
                      ) =>
                        updateStatus(
                          complaint.id,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {statuses.map(
                        (status) => (

                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {status}
                          </option>

                        )
                      )}

                    </select>

                    {updatingId ===
                      complaint.id && (

                      <p className="mt-2 text-xs text-blue-400">
                        ⏳ Updating
                        complaint...
                      </p>

                    )}

                    {/* CURRENT DEPARTMENT */}

                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">

                      <p className="text-xs text-slate-500">
                        Responsible
                        Department
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        🏢{" "}
                        {
                          complaint.department
                        }
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </section>
  );
}