"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type Notification = {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  time?: string;
  type?: string;
  complaintId?: string;
  status?: string;
  createdAt?: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD NOTIFICATIONS
     ===================================================== */

  const loadNotifications = async (uid: string) => {
    setLoading(true);
    setError("");

    try {
      /*
       * Get the complete notifications collection.
       *
       * IMPORTANT:
       * We intentionally do NOT use:
       *
       * where()
       * orderBy()
       *
       * This completely avoids Firestore index problems.
       */

      const notificationsRef = collection(
        db,
        "notifications"
      );

      const snapshot = await getDocs(
        notificationsRef
      );

      /*
       * Convert Firestore documents
       */

      const allNotifications: Notification[] =
        snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id:
              data.id ||
              document.id,

            userId:
              data.userId,

            title:
              data.title ||
              "CivicPulse Update",

            message:
              data.message || "",

            time:
              data.time || "",

            type:
              data.type || "info",

            complaintId:
              data.complaintId || "",

            status:
              data.status || "",

            createdAt:
              data.createdAt || "",
          };
        });

      /*
       * Filter notifications belonging
       * to the currently logged-in citizen.
       */

      const userNotifications =
        allNotifications.filter(
          (notification) =>
            notification.userId === uid
        );

      /*
       * Sort latest first in JavaScript.
       *
       * No Firestore orderBy().
       */

      userNotifications.sort(
        (a, b) => {
          const dateA = a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0;

          return dateB - dateA;
        }
      );

      /*
       * Keep latest 20
       */

      const latestNotifications =
        userNotifications.slice(0, 20);

      setNotifications(
        latestNotifications
      );

      /*
       * Keep localStorage synchronized
       */

      try {
        localStorage.setItem(
          "civicpulse_notifications",
          JSON.stringify(
            latestNotifications
          )
        );
      } catch {
        // Ignore localStorage errors
      }
    } catch (error: any) {
      console.error(
        "Notification loading error:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        setError(
          "You don't have permission to view notifications. Check your Firestore rules."
        );
      } else {
        setError(
          "Unable to load notifications from Firebase."
        );
      }

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FIREBASE AUTH LISTENER
     ===================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
          }

          loadNotifications(
            user.uid
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =====================================================
     CIVICPULSE UPDATE EVENT
     ===================================================== */

  useEffect(() => {
    const refreshNotifications =
      () => {
        const user =
          auth.currentUser;

        if (user) {
          loadNotifications(
            user.uid
          );
        }
      };

    window.addEventListener(
      "civicpulse-updated",
      refreshNotifications
    );

    return () => {
      window.removeEventListener(
        "civicpulse-updated",
        refreshNotifications
      );
    };
  }, []);

  /* =====================================================
     TIME FORMAT
     ===================================================== */

  const getTime = (
    notification: Notification
  ) => {
    if (notification.time) {
      return notification.time;
    }

    if (notification.createdAt) {
      const date =
        new Date(
          notification.createdAt
        );

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      }
    }

    return "Just now";
  };

  /* =====================================================
     STATUS STYLE
     ===================================================== */

  const getStatusStyle = (
    status?: string
  ) => {
    switch (status) {
      case "Submitted":
        return "bg-yellow-500/10 text-yellow-400";

      case "Under Review":
        return "bg-purple-500/10 text-purple-400";

      case "Assigned":
        return "bg-purple-500/10 text-purple-400";

      case "In Progress":
        return "bg-blue-500/10 text-blue-400";

      case "Resolved":
        return "bg-green-500/10 text-green-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  /* =====================================================
     LATEST 3
     ===================================================== */

  const visibleNotifications =
    notifications.slice(0, 3);

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-white">
            🔔 Notifications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Updates about your complaints
          </p>
        </div>

        {notifications.length > 0 && (
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
            {notifications.length}
          </span>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs text-red-400">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">

          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-2 text-xs text-slate-500">
            Loading notifications...
          </p>

        </div>

      ) : notifications.length === 0 ? (

        /* EMPTY STATE */

        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">

          <div className="text-2xl">
            🔕
          </div>

          <p className="mt-2 text-xs text-slate-500">
            No complaint updates yet.
          </p>

        </div>

      ) : (

        /* NOTIFICATIONS */

        <div className="space-y-2">

          {visibleNotifications.map(
            (item) => (

              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700"
              >

                <div className="flex gap-3">

                  {/* ICON */}

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm">
                    🔔
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-white">
                      {item.title}
                    </p>

                    {item.message && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                        {item.message}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">

                      {item.status && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      )}

                      {item.complaintId && (
                        <span className="text-[10px] text-slate-600">
                          {item.complaintId}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-600">
                        {getTime(item)}
                      </span>

                    </div>

                    {/* TRACK COMPLAINT */}

                    {item.complaintId && (
                      <Link
                        href={`/track?id=${item.complaintId}`}
                        className="mt-2 inline-block text-[11px] font-medium text-blue-400 hover:text-blue-300"
                      >
                        Track complaint →
                      </Link>
                    )}

                  </div>

                </div>

              </div>

            )
          )}

          {/* VIEW ALL */}

          {notifications.length > 3 && (
            <button
              type="button"
              className="mt-2 w-full rounded-xl border border-slate-800 py-2 text-xs font-medium text-blue-400 transition hover:bg-slate-800"
            >
              View all{" "}
              {notifications.length}{" "}
              notifications →
            </button>
          )}

        </div>

      )}

    </div>
  );
}