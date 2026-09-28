"use client";

import {
  Complaint,
  FieldWorker,
  GovernmentContract,
  GovernmentProject,
  HotspotZone,
  NotificationItem,
  PriorityLevel,
  RevenueRecord,
  User,
  UserRole,
  FraudAlert,
  CivicHealthScore,
} from '@/types/civic';

// ==========================================
// REAL-WORLD STORAGE KEYS
// ==========================================

const COMPLAINTS_KEY = 'civicpulse_complaints_real_v1';
const ROLE_KEY = 'civicpulse_current_role_v2';
const USER_KEY = 'civicpulse_current_user_v2';
const AUTH_KEY = 'civicpulse_auth_session_v2';
const WORKERS_KEY = 'civicpulse_workers_real_v1';
const NOTIFS_KEY = 'civicpulse_notifications_real_v1';
const PROJECTS_KEY = 'civicpulse_projects_real_v1';
const REVENUE_KEY = 'civicpulse_revenue_real_v1';
const CONTRACTS_KEY = 'civicpulse_contracts_real_v1';

export const DEFAULT_GUEST_USER: User = {
  id: 'guest',
  name: 'Guest Resident',
  email: '',
  phone: '',
  role: 'citizen',
  city: 'Pune',
  ward: 'Ward 3 - Shivaji Nagar',
  pincode: '411005',
};

// ==========================================
// COMPLAINTS
// ==========================================

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMPLAINTS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveComplaints(complaints: Complaint[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

// ==========================================
// ACTIVE ROLE & AUTHENTICATED USER
// ==========================================

export function getCurrentRole(): UserRole {
  if (typeof window === 'undefined') return 'citizen';
  const role = localStorage.getItem(ROLE_KEY) as UserRole;
  if (!role) {
    return 'citizen';
  }
  return role;
}

export function setCurrentRole(role: UserRole) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event('civicpulse_role_changed'));
}

export function getStoredUser(): User {
  if (typeof window === 'undefined') return DEFAULT_GUEST_USER;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    return DEFAULT_GUEST_USER;
  }
  try {
    const parsed = JSON.parse(stored) as User;
    if (parsed && parsed.name && parsed.role) {
      return parsed;
    }
    return DEFAULT_GUEST_USER;
  } catch {
    return DEFAULT_GUEST_USER;
  }
}

export function saveUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
  window.dispatchEvent(new Event('civicpulse_user_changed'));
  window.dispatchEvent(new Event('civicpulse_role_changed'));
}

export function setCurrentUser(user: User) {
  saveUser(user);
}

export function getIsAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setIsAuthenticated(auth: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, auth ? 'true' : 'false');
  window.dispatchEvent(new Event('civicpulse_auth_changed'));
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, 'false');
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('civicpulse_auth_changed'));
  window.dispatchEvent(new Event('civicpulse_user_changed'));
}

// ==========================================
// FIELD WORKERS
// ==========================================

export function getStoredWorkers(): FieldWorker[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WORKERS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveWorkers(workers: FieldWorker[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTIFS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: NotificationItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

// ==========================================
// GOVERNMENT PROJECTS
// ==========================================

export function getStoredProjects(): GovernmentProject[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveProjects(projects: GovernmentProject[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

export const DEFAULT_GOVERNMENT_CONTRACTS: GovernmentContract[] = [
  {
    id: 'PMC-2025-SAAS-01',
    municipalityName: 'Pune Municipal Corporation (PMC)',
    contractTier: 'Tier 1 Metro',
    annualValue: 3000000,
    awardedAuthority: 'PMC Central Municipal IT & Public Works',
    adminCommissionPercent: 2.5,
    startDate: '2025-04-01',
    renewalDate: '2026-03-31',
    status: 'Active',
    serviceScope: [
      'AI Multimodal YOLO Defect Detection',
      'Automated Ward Ticket Routing',
      'Citizen Emergency 4h SLA Escalations',
      'Worker Guild Escrow Payout Management',
    ],
  },
  {
    id: 'PCMC-2025-SMART-04',
    municipalityName: 'Pimpri-Chinchwad Smart City Ltd (PCMC)',
    contractTier: 'Smart City District',
    annualValue: 2160000,
    awardedAuthority: 'PCMC Smart City SPV Development Board',
    adminCommissionPercent: 2.5,
    startDate: '2025-06-01',
    renewalDate: '2026-05-31',
    status: 'Active',
    serviceScope: [
      'Predictive Civic Hotspots Telemetry',
      'Public Capital Project Funds Audit',
      'Contractor Milestone Verification',
    ],
  },
  {
    id: 'BBMP-2026-PILOT-09',
    municipalityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    contractTier: 'Tier 1 Metro',
    annualValue: 1800000,
    awardedAuthority: 'BBMP Urban Infrastructure Task Force',
    adminCommissionPercent: 3.0,
    startDate: '2026-01-01',
    renewalDate: '2026-12-31',
    status: 'Under Renewal',
    serviceScope: [
      'Flood & Drain Choke Radar',
      'Road Craters & Bitumen Audit',
    ],
  },
];

export const DEFAULT_REVENUE_RECORDS: RevenueRecord[] = [
  {
    id: 'TXN-CP-1001',
    type: 'Govt SaaS Management',
    stream: 'primary',
    description: 'Municipal SaaS Platform & AI Management Retainer (Q1 2026)',
    amount: 250000,
    grossAmount: 250000,
    adminCutPercent: 100,
    payer: 'Pune Municipal Corporation (PMC)',
    payee: 'CivicPulse AI Technologies',
    paymentMethod: 'PFMS Treasury Direct Debit',
    transactionRef: 'PFMS/PMC/2026/0894218',
    invoiceId: 'INV-CP-2026-001',
    date: '2026-03-24T10:30:00.000Z',
    status: 'Settled',
  },
  {
    id: 'TXN-CP-1002',
    type: 'Govt SaaS Management',
    stream: 'primary',
    description: 'Smart City App Management & SLA Escalation Retainer',
    amount: 180000,
    grossAmount: 180000,
    adminCutPercent: 100,
    payer: 'Pimpri-Chinchwad Municipal Corp (PCMC)',
    payee: 'CivicPulse AI Technologies',
    paymentMethod: 'PFMS Treasury Direct Debit',
    transactionRef: 'PFMS/PCMC/2026/0431201',
    invoiceId: 'INV-CP-2026-002',
    date: '2026-03-26T14:15:00.000Z',
    status: 'Settled',
  },
  {
    id: 'TXN-CP-1003',
    type: 'Contract Authority Commission',
    stream: 'contract_cut',
    description: 'Ward 12 Road Resurfacing Tender (2.5% Admin Commission)',
    amount: 62500,
    grossAmount: 2500000,
    adminCutPercent: 2.5,
    payer: 'PMC Roads & Infrastructure Department',
    payee: 'M/S Larsen Infra Ltd (Awarded Authority)',
    paymentMethod: 'Treasury Project Escrow Account',
    transactionRef: 'PFMS/TENDER/2026/092144',
    invoiceId: 'INV-CP-2026-003',
    date: '2026-03-27T11:45:00.000Z',
    status: 'Settled',
  },
  {
    id: 'TXN-CP-1004',
    type: 'Contract Authority Commission',
    stream: 'contract_cut',
    description: 'Smart Stormwater Culvert Modernization (2.5% Admin Commission)',
    amount: 45000,
    grossAmount: 1800000,
    adminCutPercent: 2.5,
    payer: 'Smart City Development SPV',
    payee: 'Pune Civil Engineering Works Ltd',
    paymentMethod: 'Treasury Project Escrow Account',
    transactionRef: 'PFMS/TENDER/2026/054329',
    invoiceId: 'INV-CP-2026-004',
    date: '2026-03-28T09:20:00.000Z',
    status: 'Settled',
  },
  {
    id: 'TXN-CP-1005',
    type: 'Worker Transaction Fee',
    stream: 'secondary',
    description: 'Work Order Settlement #CP-99842101 (5% Platform Fee)',
    amount: 200,
    grossAmount: 4000,
    adminCutPercent: 5.0,
    payer: 'Pune Municipal Corporation (Govt Escrow)',
    payee: 'Technician Utsav Kumar (Worker Guild)',
    paymentMethod: 'CivicPulse Automated Worker Escrow Payout',
    transactionRef: 'UTR-HDFC-994821034',
    invoiceId: 'INV-CP-2026-005',
    date: '2026-03-28T16:00:00.000Z',
    status: 'Settled',
  },
  {
    id: 'TXN-CP-1006',
    type: 'Worker Transaction Fee',
    stream: 'secondary',
    description: 'Work Order Settlement #CP-88412092 (5% Platform Fee)',
    amount: 350,
    grossAmount: 7000,
    adminCutPercent: 5.0,
    payer: 'Pune Municipal Corporation (Govt Escrow)',
    payee: 'Technician Ramesh Pawar (Worker Guild)',
    paymentMethod: 'CivicPulse Automated Worker Escrow Payout',
    transactionRef: 'UTR-SBI-443921849',
    invoiceId: 'INV-CP-2026-006',
    date: '2026-03-28T18:30:00.000Z',
    status: 'Settled',
  },
];

// ==========================================
// REVENUE & CONTRACT RECORDS
// ==========================================

export function getStoredRevenue(): RevenueRecord[] {
  if (typeof window === 'undefined') return DEFAULT_REVENUE_RECORDS;
  const stored = localStorage.getItem(REVENUE_KEY);
  if (!stored) {
    saveRevenue(DEFAULT_REVENUE_RECORDS);
    return DEFAULT_REVENUE_RECORDS;
  }
  try {
    const parsed = JSON.parse(stored);
    return parsed && parsed.length > 0 ? parsed : DEFAULT_REVENUE_RECORDS;
  } catch {
    return DEFAULT_REVENUE_RECORDS;
  }
}

export function saveRevenue(rev: RevenueRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REVENUE_KEY, JSON.stringify(rev));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

export function getStoredContracts(): GovernmentContract[] {
  if (typeof window === 'undefined') return DEFAULT_GOVERNMENT_CONTRACTS;
  const stored = localStorage.getItem(CONTRACTS_KEY);
  if (!stored) {
    saveContracts(DEFAULT_GOVERNMENT_CONTRACTS);
    return DEFAULT_GOVERNMENT_CONTRACTS;
  }
  try {
    const parsed = JSON.parse(stored);
    return parsed && parsed.length > 0 ? parsed : DEFAULT_GOVERNMENT_CONTRACTS;
  } catch {
    return DEFAULT_GOVERNMENT_CONTRACTS;
  }
}

export function saveContracts(contracts: GovernmentContract[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
  window.dispatchEvent(new Event('civicpulse_store_updated'));
}

// ==========================================
// REAL ALGORITHMIC DUPLICATE DETECTION
// ==========================================

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(
    text1
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const words2 = new Set(
    text2
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

export function detectDuplicateComplaints(
  newLat: number,
  newLng: number,
  newCategory: string,
  newTitle: string,
  newDescription: string
): { matches: Complaint[]; highestConfidence: number } {
  const complaints = getStoredComplaints();
  const matches: { complaint: Complaint; score: number }[] = [];

  for (const item of complaints) {
    if (item.status === 'Resolved') continue;

    let score = 0;

    // 1. Geographic proximity (up to 50% score)
    if (item.location && item.location.latitude && item.location.longitude) {
      const distKm = calculateDistanceKm(
        newLat,
        newLng,
        item.location.latitude,
        item.location.longitude
      );
      if (distKm <= 0.1) {
        // Within 100 meters
        score += 50;
      } else if (distKm <= 0.3) {
        // Within 300 meters
        score += 35;
      } else if (distKm <= 0.6) {
        // Within 600 meters
        score += 20;
      }
    }

    // 2. Category match (up to 25% score)
    if (item.category.toLowerCase() === newCategory.toLowerCase()) {
      score += 25;
    }

    // 3. Text description / title similarity (up to 25% score)
    const titleSim = calculateTextSimilarity(item.title, newTitle);
    const descSim = calculateTextSimilarity(item.description, newDescription);
    const textSim = Math.max(titleSim, descSim);
    score += Math.round(textSim * 25);

    if (score >= 45) {
      matches.push({ complaint: item, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return {
    matches: matches.map((m) => m.complaint),
    highestConfidence: matches.length > 0 ? matches[0].score : 0,
  };
}
