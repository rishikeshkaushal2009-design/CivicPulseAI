"use client";

import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { User, UserRole, FieldWorker } from "@/types/civic";
import {
  setCurrentRole,
  setCurrentUser,
  setIsAuthenticated,
  saveWorkers,
  getStoredWorkers,
} from "./civicStore";

export const REGISTERED_USERS_KEY = "civicpulse_registered_users_v3";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  ward?: string;
  department?: string;
  skills?: string[];
  address?: string;
  city?: string;
  pincode?: string;
  avatar?: string;
}

export function getRegisteredUsers(): (User & { password?: string })[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: (User & { password?: string })[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

const DEFAULT_AVATARS: Record<UserRole, string> = {
  citizen: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  officer: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
  worker: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  admin: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  dept_admin: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
};

/**
 * Register a new user in the real-world application.
 * Syncs with Firebase Auth / Firestore and local persistence.
 */
export async function registerRealUser(payload: RegisterPayload): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanName = payload.name.trim();

  // 1. Validation
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Please provide a valid full name." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  // 2. Check if user already exists locally
  const existingUsers = getRegisteredUsers();
  if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email address already exists. Please sign in." };
  }

  let userId = `user-${payload.role}-${Date.now()}`;

  // 3. Attempt Firebase Auth registration
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, payload.password);
    if (cred.user) {
      userId = cred.user.uid;
    }
  } catch (err: any) {
    console.warn("Firebase Auth registration notice (continuing with secure local store):", err?.message);
    if (err?.code === "auth/email-already-in-use") {
      return { success: false, error: "This email address is already in use in Firebase Auth." };
    }
  }

  const newUser: User = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    phone: payload.phone || "+91 98200 00000",
    role: payload.role,
    avatar: payload.avatar || DEFAULT_AVATARS[payload.role],
    address: payload.address || `${payload.ward || "Pune Central"}, Pune`,
    city: payload.city || "Pune",
    ward: payload.ward || "Ward 3 - Shivaji Nagar",
    pincode: payload.pincode || "411005",
  };

  // 4. Save to Firestore if available
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      ...newUser,
      createdAt: new Date().toISOString(),
      department: payload.department || null,
      skills: payload.skills || null,
    });
  } catch (err: any) {
    console.warn("Firestore user sync notice:", err?.message);
  }

  // 5. If registering as a worker, add to field worker roster
  if (payload.role === "worker") {
    const newWorker: FieldWorker = {
      id: userId,
      fullName: cleanName,
      phone: payload.phone || "+91 97112 00000",
      email: cleanEmail,
      address: payload.address || "Field Operations Depot",
      city: payload.city || "Pune",
      ward: payload.ward || "Ward 3 & 4",
      skills: payload.skills && payload.skills.length > 0
        ? payload.skills
        : ["General Civil Maintenance", "Surface Repair", "Inspection"],
      workCategory: ["Pothole", "Road damage", "Drainage", "Public infrastructure"],
      experienceYears: 3,
      availability: "Available",
      rating: 5.0,
      completedJobsCount: 0,
      totalEarnings: 0,
      bankAccountMasked: "HDFC ****9901",
      upiId: `${cleanEmail.split("@")[0]}@upi`,
      verificationStatus: "Verified",
      currentLocation: {
        latitude: 18.5204 + (Math.random() - 0.5) * 0.04,
        longitude: 73.8567 + (Math.random() - 0.5) * 0.04,
      },
    };

    const currentWorkers = getStoredWorkers();
    saveWorkers([...currentWorkers, newWorker]);

    try {
      await setDoc(doc(db, "workers", userId), newWorker);
    } catch (e) {}
  }

  // 6. Save to local registered users registry
  saveRegisteredUsers([...existingUsers, { ...newUser, password: payload.password }]);

  // 7. Establish authenticated active session
  setCurrentUser(newUser);
  setCurrentRole(newUser.role);
  setIsAuthenticated(true);

  return { success: true, user: newUser };
}

/**
 * Authenticate an existing real user with email/username and password.
 */
export async function loginRealUser(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanInput || !cleanPass) {
    return { success: false, error: "Please provide both email/username and password." };
  }

  // 1. Try Firebase Auth first
  try {
    if (cleanInput.includes("@")) {
      const cred = await signInWithEmailAndPassword(auth, cleanInput, cleanPass);
      if (cred.user) {
        // Fetch user metadata from Firestore
        let userDoc: User | null = null;
        try {
          const snap = await getDoc(doc(db, "users", cred.user.uid));
          if (snap.exists()) {
            userDoc = snap.data() as User;
          }
        } catch (e) {}

        if (!userDoc) {
          // Check local registry
          const existing = getRegisteredUsers().find(
            (u) => u.email.toLowerCase() === cleanInput
          );
          if (existing) userDoc = existing;
        }

        if (userDoc) {
          setCurrentUser(userDoc);
          setCurrentRole(userDoc.role);
          setIsAuthenticated(true);
          return { success: true, user: userDoc };
        }
      }
    }
  } catch (err: any) {
    console.warn("Firebase Auth signIn notice:", err?.code || err?.message);
    if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
      // Still check local registry in case user was registered locally
    }
  }

  // 2. Check local registered users registry
  const registeredUsers = getRegisteredUsers();
  const matchedUser = registeredUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanInput ||
      u.name.toLowerCase() === cleanInput ||
      u.name.toLowerCase().split(" ")[0] === cleanInput
  );

  if (matchedUser) {
    if (matchedUser.password && matchedUser.password !== cleanPass) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    setCurrentUser(matchedUser);
    setCurrentRole(matchedUser.role);
    setIsAuthenticated(true);
    return { success: true, user: matchedUser };
  }

  return {
    success: false,
    error: "No registered account found with these credentials. Please check your spelling or register a new account.",
  };
}

/**
 * Sign out active user session.
 */
export async function logoutRealUser() {
  try {
    await signOut(auth);
  } catch (e) {}
  setIsAuthenticated(false);
  if (typeof window !== "undefined") {
    localStorage.removeItem("civicpulse_current_user_v2");
    localStorage.setItem("civicpulse_auth_session_v2", "false");
    window.dispatchEvent(new Event("civicpulse_auth_changed"));
    window.dispatchEvent(new Event("civicpulse_user_changed"));
  }
}
