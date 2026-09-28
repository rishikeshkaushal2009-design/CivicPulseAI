export type UserRole =
  | 'citizen'
  | 'officer'
  | 'worker'
  | 'admin'
  | 'dept_admin';

export type ComplaintCategory =
  | 'Pothole'
  | 'Broken streetlight'
  | 'Garbage'
  | 'Water supply'
  | 'Drainage'
  | 'Road damage'
  | 'Traffic'
  | 'Sewage'
  | 'Public toilet'
  | 'Illegal dumping'
  | 'Electricity-related civic issue'
  | 'Public infrastructure'
  | 'Other';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type SeverityLevel = 'Minor' | 'Moderate' | 'Severe' | 'Critical Hazardous';

export type ComplaintStage =
  | 'Submitted'
  | 'AI Analyzed'
  | 'Department Assigned'
  | 'Officer Reviewed'
  | 'Worker Assigned'
  | 'Work Started'
  | 'Work Completed'
  | 'Verification'
  | 'Resolved'
  | 'Rework Required';

export type WorkerVerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';

export type WorkerJobStatus =
  | 'Available'
  | 'Job Assigned'
  | 'Accepted'
  | 'On the Way'
  | 'Work Started'
  | 'Work Completed'
  | 'Verification'
  | 'Payment Released';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  city?: string;
  ward?: string;
  pincode?: string;
}

export interface ComplaintLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  ward: string;
  pincode: string;
  detectedAutomatically?: boolean;
}

export interface BoundingBox {
  ymin: number; // 0 to 1 normalized coordinate
  xmin: number; // 0 to 1 normalized coordinate
  ymax: number; // 0 to 1 normalized coordinate
  xmax: number; // 0 to 1 normalized coordinate
  label: string;
  confidence: number;
  isDefect: boolean;
}

export interface AIAnalysisResult {
  category: ComplaintCategory;
  severity: SeverityLevel;
  priority: PriorityLevel;
  summary: string;
  department: string;
  suggestedAction: string;
  reason: string;
  estimatedUrgency: string;
  confidenceScore: number;
  detectedObjects?: string[];
  safetyRiskIndex?: number;

  // YOLO Vision Defect Validation & Rejection
  isValidCivicIssue?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  boundingBoxes?: BoundingBox[];
  defectWidthCm?: number;
  defectDepthCm?: number;
  yoloModelVersion?: string;
}

export interface TimelineEntry {
  stage: ComplaintStage;
  label: string;
  description: string;
  timestamp: string;
  actor: string;
  completed: boolean;
}

export interface StatusHistoryEntry {
  status: ComplaintStage;
  message: string;
  timestamp: string;
  updatedBy: string;
}

export interface ResolutionProof {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  workDescription: string;
  completionTimestamp: string;
  gpsConfirmed: boolean;
  aiVerificationScore: number;
  aiVerificationSummary: string;
}

export interface CitizenVerification {
  isConfirmed: boolean;
  citizenComments?: string;
  verifiedAt?: string;
  incompleteEvidenceUrl?: string;
}

export interface WorkerPayment {
  jobBudgetCents: number; // e.g. 5000 INR
  workerPayout: number; // e.g. 4000 INR
  platformFee: number; // e.g. 1000 INR
  paymentStatus: 'Pending' | 'Escrowed' | 'Released' | 'Refunded';
  transactionId?: string;
  releasedAt?: string;
  invoiceUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface Complaint {
  id: string; // e.g. CP-99840040
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  severity: SeverityLevel;
  department: string;
  status: ComplaintStage;
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  slaDeadline: string;
  isEscalated: boolean;
  escalatedTo?: string;
  isEmergency: boolean;
  
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;

  location: ComplaintLocation;
  images: string[];
  voiceNoteUrl?: string;
  videoUrl?: string;

  aiAnalysis: AIAnalysisResult;

  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  workerJobStatus?: WorkerJobStatus;
  workerEtaMinutes?: number;
  workerCurrentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };

  upvotes: number;
  upvotedByUserIds: string[];
  affectedCitizensCount: number;
  comments: Comment[];
  evidencePhotos: { url: string; submittedBy: string; timestamp: string }[];

  timeline: TimelineEntry[];
  history: StatusHistoryEntry[];

  resolutionProof?: ResolutionProof;
  citizenVerification?: CitizenVerification;
  payment: WorkerPayment;

  duplicateConfidence?: number;
  duplicateOfId?: string;
  isFlaggedForFraud?: boolean;
  fraudAlertReason?: string;
}

export interface FieldWorker {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  ward: string;
  skills: string[];
  workCategory: ComplaintCategory[];
  experienceYears: number;
  availability: 'Available' | 'On Active Job' | 'Offline';
  rating: number;
  completedJobsCount: number;
  totalEarnings: number;
  bankAccountMasked: string;
  upiId: string;
  idDocUrl?: string;
  verificationStatus: WorkerVerificationStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  icon: string;
  officerInCharge: string;
  activeStaffCount: number;
  totalComplaints: number;
  resolvedComplaints: number;
  slaAdherenceRate: number; // percentage
  avgResolutionHours: number;
}

export interface GovernmentProject {
  id: string;
  title: string;
  description: string;
  department: string;
  allocatedBudget: number; // INR
  spentBudget: number;
  remainingBudget: number;
  projectStatus: 'Planning' | 'In Progress' | 'Under Review' | 'Completed';
  contractorOrWorker: string;
  completionPercentage: number;
  startDate: string;
  targetEndDate: string;
  ward: string;
}

export type RevenueStreamType =
  | 'Govt SaaS Management'
  | 'Worker Transaction Fee'
  | 'Contract Authority Commission'
  | 'Govt Contract'
  | 'Service Management Fee';

export interface GovernmentContract {
  id: string;
  municipalityName: string;
  contractTier: 'Tier 1 Metro' | 'Municipal Corporation' | 'Smart City District';
  annualValue: number; // INR
  awardedAuthority?: string;
  adminCommissionPercent?: number;
  startDate: string;
  renewalDate: string;
  status: 'Active' | 'Under Renewal';
  serviceScope: string[];
}

export interface RevenueRecord {
  id: string;
  type: RevenueStreamType;
  stream?: 'primary' | 'secondary' | 'contract_cut';
  description: string;
  amount: number;
  grossAmount?: number;
  adminCutPercent?: number;
  payer?: string;
  payee?: string;
  paymentMethod?: string;
  transactionRef?: string;
  invoiceId?: string;
  date: string;
  relatedComplaintId?: string;
  relatedContractId?: string;
  status: 'Recorded' | 'Settled';
}

export interface CivicHealthScore {
  cityScore: number;
  cityGrade: string;
  totalWards: number;
  resolvedRate: number;
  avgResolutionTimeHours: number;
  citizenSatisfactionRate: number;
  wardScores: {
    ward: string;
    score: number;
    grade: string;
    criticalCount: number;
    resolvedRate: number;
  }[];
  departmentScores: {
    department: string;
    score: number;
    activeCount: number;
  }[];
}

export interface HotspotZone {
  id: string;
  name: string;
  ward: string;
  category: ComplaintCategory;
  frequencyCount: number;
  riskLevel: 'Moderate' | 'High' | 'Severe Hazard';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  aiDiagnostic: string;
  suggestedPreventativeAction: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole;
  targetUserId?: string;
  title: string;
  message: string;
  complaintId?: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'emergency' | 'success';
}

export interface FraudAlert {
  id: string;
  complaintId: string;
  complaintTitle: string;
  flaggedReason: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Pending Admin Review' | 'Cleared' | 'Confirmed Fraud';
  detectedAt: string;
  citizenName: string;
}
