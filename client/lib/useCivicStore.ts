"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  Complaint,
  FieldWorker,
  GovernmentProject,
  NotificationItem,
  RevenueRecord,
  User,
  UserRole,
  WorkerJobStatus,
  ComplaintStage,
  PriorityLevel,
} from '@/types/civic';
import {
  DEFAULT_GUEST_USER,
  getStoredComplaints,
  getStoredNotifications,
  getStoredProjects,
  getStoredRevenue,
  getStoredWorkers,
  getCurrentRole,
  saveComplaints,
  saveNotifications,
  saveProjects,
  saveRevenue,
  saveWorkers,
  setCurrentRole,
  getStoredUser,
  saveUser,
  setCurrentUser,
  getIsAuthenticated,
  setIsAuthenticated,
  logout as civicStoreLogout,
} from './civicStore';
import { getRegisteredUsers } from './authService';

export function useCivicStore() {
  const [role, setRoleState] = useState<UserRole>('citizen');
  const [user, setUser] = useState<User>(DEFAULT_GUEST_USER);
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<FieldWorker[]>([]);
  const [projects, setProjects] = useState<GovernmentProject[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshAll = useCallback(() => {
    const currentR = getCurrentRole();
    const storedU = getStoredUser();
    const isAuth = getIsAuthenticated();
    setRoleState(currentR);
    setUser(storedU);
    setIsAuthenticatedState(isAuth);
    setComplaints(getStoredComplaints());
    setWorkers(getStoredWorkers());
    setProjects(getStoredProjects());
    setRevenue(getStoredRevenue());
    setNotifications(getStoredNotifications());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshAll();

    const handleUpdate = () => refreshAll();
    window.addEventListener('civicpulse_store_updated', handleUpdate);
    window.addEventListener('civicpulse_role_changed', handleUpdate);
    window.addEventListener('civicpulse_user_changed', handleUpdate);
    window.addEventListener('civicpulse_auth_changed', handleUpdate);

    return () => {
      window.removeEventListener('civicpulse_store_updated', handleUpdate);
      window.removeEventListener('civicpulse_role_changed', handleUpdate);
      window.removeEventListener('civicpulse_user_changed', handleUpdate);
      window.removeEventListener('civicpulse_auth_changed', handleUpdate);
    };
  }, [refreshAll]);

  const login = useCallback((targetRole: UserRole, targetUser?: User) => {
    const nextUser = targetUser || {
      ...DEFAULT_GUEST_USER,
      role: targetRole,
    };
    setCurrentRole(targetRole);
    setCurrentUser(nextUser);
    setIsAuthenticated(true);
    setRoleState(targetRole);
    setUser(nextUser);
    setIsAuthenticatedState(true);
  }, []);

  const logout = useCallback(() => {
    civicStoreLogout();
    setIsAuthenticatedState(false);
    setUser(DEFAULT_GUEST_USER);
  }, []);

  const switchRole = useCallback((newRole: UserRole, targetUser?: User) => {
    const nextUser = targetUser || {
      ...DEFAULT_GUEST_USER,
      role: newRole,
    };
    setCurrentRole(newRole);
    setCurrentUser(nextUser);
    setIsAuthenticated(true);
    setRoleState(newRole);
    setUser(nextUser);
    setIsAuthenticatedState(true);
  }, []);

  const switchUser = useCallback((newUser: User) => {
    setCurrentUser(newUser);
    setRoleState(newUser.role);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    const currentU = getStoredUser();
    const updated: User = { ...currentU, ...updatedFields };
    saveUser(updated);
    setUser(updated);
    setRoleState(updated.role);
  }, []);

  const addComplaint = useCallback(
    (newComplaint: Complaint) => {
      const current = getStoredComplaints();
      const updated = [newComplaint, ...current];
      saveComplaints(updated);

      // Create notification for Municipal Officer
      const notifs = getStoredNotifications();
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        targetRole: 'officer',
        title: `New ${newComplaint.priority} Complaint: ${newComplaint.title.slice(0, 35)}...`,
        message: `Reported in ${newComplaint.location.ward}. AI classified as ${newComplaint.category}.`,
        complaintId: newComplaint.id,
        timestamp: new Date().toISOString(),
        read: false,
        type: newComplaint.priority === 'Critical' ? 'emergency' : 'info',
      };
      saveNotifications([newNotif, ...notifs]);
    },
    []
  );

  const upvoteComplaint = useCallback((complaintId: string) => {
    const current = getStoredComplaints();
    const currentU = getStoredUser();

    const updated = current.map((c) => {
      if (c.id === complaintId) {
        const alreadyUpvoted = c.upvotedByUserIds?.includes(currentU.id);
        const upvotedByUserIds = alreadyUpvoted
          ? c.upvotedByUserIds.filter((uid) => uid !== currentU.id)
          : [...(c.upvotedByUserIds || []), currentU.id];
        const upvotes = alreadyUpvoted ? Math.max(0, c.upvotes - 1) : c.upvotes + 1;
        const affectedCitizensCount = alreadyUpvoted
          ? Math.max(1, c.affectedCitizensCount - 1)
          : c.affectedCitizensCount + 4;

        // Auto boost priority if over 50 upvotes
        let priority = c.priority;
        if (upvotes > 50 && priority === 'Medium') priority = 'High';

        return {
          ...c,
          upvotes,
          upvotedByUserIds,
          affectedCitizensCount,
          priority,
        };
      }
      return c;
    });
    saveComplaints(updated);
  }, []);

  const addComment = useCallback((complaintId: string, text: string) => {
    if (!text.trim()) return;
    const current = getStoredComplaints();
    const currentU = getStoredUser();

    const updated = current.map((c) => {
      if (c.id === complaintId) {
        const newComment = {
          id: `comm-${Date.now()}`,
          userId: currentU.id,
          userName: `${currentU.name} (${currentU.role.toUpperCase()})`,
          userRole: currentU.role,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          avatar: currentU.avatar,
        };
        return {
          ...c,
          comments: [...(c.comments || []), newComment],
        };
      }
      return c;
    });
    saveComplaints(updated);
  }, []);

  const assignWorker = useCallback((complaintId: string, workerId: string) => {
    const currentComplaints = getStoredComplaints();
    const currentWorkers = getStoredWorkers();
    const targetWorker = currentWorkers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    const updatedComplaints = currentComplaints.map((c) => {
      if (c.id === complaintId) {
        const now = new Date().toISOString();
        const updatedTimeline = c.timeline.map((t) => {
          if (t.stage === 'Worker Assigned') {
            return {
              ...t,
              completed: true,
              timestamp: now,
              description: `Assigned to ${targetWorker.fullName} (Rating ${targetWorker.rating}).`,
            };
          }
          if (t.stage === 'Work Started') {
            return { ...t, description: 'Worker en route to site.' };
          }
          return t;
        });

        return {
          ...c,
          assignedWorkerId: targetWorker.id,
          assignedWorkerName: targetWorker.fullName,
          status: 'Worker Assigned' as ComplaintStage,
          workerJobStatus: 'Job Assigned' as WorkerJobStatus,
          workerEtaMinutes: 20,
          updatedAt: now,
          timeline: updatedTimeline,
        };
      }
      return c;
    });

    saveComplaints(updatedComplaints);

    // Notify worker
    const notifs = getStoredNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      targetRole: 'worker',
      title: 'New Work Order Assigned',
      message: `You have been dispatched to complaint #${complaintId}.`,
      complaintId,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info',
    };
    saveNotifications([newNotif, ...notifs]);
  }, []);

  const updateWorkerJobStatus = useCallback(
    (complaintId: string, status: WorkerJobStatus, extraData?: Partial<Complaint>) => {
      const currentComplaints = getStoredComplaints();
      const updatedComplaints = currentComplaints.map((c) => {
        if (c.id === complaintId) {
          const now = new Date().toISOString();
          let nextStage: ComplaintStage = c.status;

          if (status === 'On the Way' || status === 'Work Started') {
            nextStage = 'Work Started';
          } else if (status === 'Work Completed' || status === 'Verification') {
            nextStage = 'Work Completed';
          }

          const updatedTimeline = c.timeline.map((t) => {
            if (status === 'Work Started' && t.stage === 'Work Started') {
              return { ...t, completed: true, timestamp: now, description: 'Technician on-site.' };
            }
            if (status === 'Work Completed' && t.stage === 'Work Completed') {
              return {
                ...t,
                completed: true,
                timestamp: now,
                description: 'Physical repairs completed. Verification proof uploaded.',
              };
            }
            return t;
          });

          return {
            ...c,
            ...extraData,
            workerJobStatus: status,
            status: nextStage,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      });

      saveComplaints(updatedComplaints);
    },
    []
  );

  const submitWorkProof = useCallback(
    (
      complaintId: string,
      proof: {
        beforePhotoUrl: string;
        afterPhotoUrl: string;
        workDescription: string;
        aiVerificationScore?: number;
      }
    ) => {
      const currentComplaints = getStoredComplaints();
      const now = new Date().toISOString();

      const updated = currentComplaints.map((c) => {
        if (c.id === complaintId) {
          const aiScore = proof.aiVerificationScore || 96.5;
          const resolutionProof = {
            beforePhotoUrl: proof.beforePhotoUrl,
            afterPhotoUrl: proof.afterPhotoUrl,
            workDescription: proof.workDescription,
            completionTimestamp: now,
            gpsConfirmed: true,
            aiVerificationScore: aiScore,
            aiVerificationSummary: `AI verified completion with ${aiScore}% visual match.`,
          };

          const updatedTimeline = c.timeline.map((t) => {
            if (t.stage === 'Work Completed') {
              return { ...t, completed: true, timestamp: now };
            }
            if (t.stage === 'Verification') {
              return {
                ...t,
                description: 'Pending citizen verification.',
              };
            }
            return t;
          });

          return {
            ...c,
            status: 'Verification' as ComplaintStage,
            workerJobStatus: 'Work Completed' as WorkerJobStatus,
            resolutionProof,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      });

      saveComplaints(updated);

      // Notify citizen
      const notifs = getStoredNotifications();
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        targetRole: 'citizen',
        title: 'Work Completed on your Complaint',
        message: `Repairs for complaint #${complaintId} have been completed. Please review and verify.`,
        complaintId,
        timestamp: now,
        read: false,
        type: 'success',
      };
      saveNotifications([newNotif, ...notifs]);
    },
    []
  );

  const verifyResolution = useCallback(
    (complaintId: string, isConfirmed: boolean, comments?: string) => {
      const currentComplaints = getStoredComplaints();
      const now = new Date().toISOString();

      const updated = currentComplaints.map((c) => {
        if (c.id === complaintId) {
          const citizenVerification = {
            isConfirmed,
            citizenComments: comments || (isConfirmed ? 'Verified & satisfied' : 'Rework requested'),
            verifiedAt: now,
          };

          const newStatus: ComplaintStage = isConfirmed ? 'Resolved' : 'Rework Required';

          const updatedTimeline = c.timeline.map((t) => {
            if (t.stage === 'Verification') {
              return { ...t, completed: true, timestamp: now, description: citizenVerification.citizenComments };
            }
            if (t.stage === 'Resolved' && isConfirmed) {
              return { ...t, completed: true, timestamp: now, description: 'Closed & verified by citizen.' };
            }
            return t;
          });

          return {
            ...c,
            status: newStatus,
            citizenVerification,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      });

      saveComplaints(updated);
    },
    []
  );

  const overrideDepartment = useCallback((complaintId: string, newDept: string) => {
    const currentComplaints = getStoredComplaints();
    const updated = currentComplaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          department: newDept,
          departmentOverridden: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveComplaints(updated);
  }, []);

  const overridePriority = useCallback((complaintId: string, newPriority: PriorityLevel) => {
    const currentComplaints = getStoredComplaints();
    const updated = currentComplaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          priority: newPriority,
          priorityOverridden: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveComplaints(updated);
  }, []);

  const escalateComplaint = useCallback((complaintId: string, reason?: string) => {
    const currentComplaints = getStoredComplaints();
    const updated = currentComplaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          escalated: true,
          priority: 'Critical' as PriorityLevel,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveComplaints(updated);

    const notifs = getStoredNotifications();
    saveNotifications([
      {
        id: `notif-${Date.now()}`,
        targetRole: 'dept_admin',
        title: `🚨 Escalated Complaint: #${complaintId}`,
        message: reason || 'Escalated due to SLA breach or severe public safety risk.',
        complaintId,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'emergency',
      },
      ...notifs,
    ]);
  }, []);

  const registeredUsers = getRegisteredUsers();
  const personas = registeredUsers.map((u) => ({
    user: u,
    label: u.name,
    badge: u.role.toUpperCase(),
    desc: `${u.ward || u.city || 'Pune'} • ${u.email}`,
    targetRoute:
      u.role === 'officer'
        ? '/officer'
        : u.role === 'worker'
        ? '/worker'
        : u.role === 'admin'
        ? '/admin'
        : u.role === 'dept_admin'
        ? '/analytics'
        : '/dashboard',
  }));

  return {
    mounted,
    isAuthenticated,
    role,
    user,
    login,
    logout,
    complaints,
    workers,
    projects,
    revenue,
    notifications,
    switchRole,
    switchUser,
    updateUser,
    personas,
    addComplaint,
    upvoteComplaint,
    addComment,
    assignWorker,
    updateWorkerJobStatus,
    submitWorkProof,
    verifyResolution,
    overrideDepartment,
    overridePriority,
    escalateComplaint,
  };
}
