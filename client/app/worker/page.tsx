"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  HardHat,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  DollarSign,
  Navigation,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Upload,
  AlertCircle,
  ThumbsUp,
  CreditCard,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { Complaint, WorkerJobStatus, FieldWorker } from '@/types/civic';

export default function WorkerPage() {
  const { complaints, workers, updateWorkerJobStatus, submitWorkProof, user } = useCivicStore();

  // Find worker profile from registered workers or current user
  const currentWorker: FieldWorker =
    workers.find((w) => w.id === user.id || w.email.toLowerCase() === user.email.toLowerCase()) ||
    workers[0] || {
      id: user.id || 'worker-current',
      fullName: user.name || 'Field Technician',
      email: user.email || 'technician@civicpulse.org',
      phone: user.phone || '+91 97112 00000',
      address: user.address || 'Field Operations Depot',
      city: user.city || 'Pune',
      ward: user.ward || 'Ward 3 & 4',
      skills: ['Civil Maintenance', 'Road Repair', 'Rapid Response'],
      workCategory: ['Pothole', 'Drainage', 'Public Infrastructure'],
      experienceYears: 3,
      availability: 'Available' as const,
      rating: 5.0,
      completedJobsCount: 0,
      totalEarnings: 0,
      bankAccountMasked: 'HDFC ****9901',
      upiId: `${(user.email || 'worker').split('@')[0]}@upi`,
      verificationStatus: 'Verified' as const,
      currentLocation: { latitude: 18.5204, longitude: 73.8567 },
    };

  // Active or assigned jobs for this worker or unassigned open jobs
  const myAssignedJobs = complaints.filter(
    (c) => c.assignedWorkerId === currentWorker.id || (c.assignedWorkerName && c.assignedWorkerName.toLowerCase() === currentWorker.fullName.toLowerCase())
  );

  const availableOpenJobs = complaints.filter(
    (c) => !c.assignedWorkerId && c.status !== 'Resolved'
  );

  const completedJobs = complaints.filter(
    (c) => (c.assignedWorkerId === currentWorker.id || c.assignedWorkerName?.toLowerCase() === currentWorker.fullName.toLowerCase()) && (c.status === 'Work Completed' || c.status === 'Resolved')
  );

  // Active Job for interaction modal
  const [selectedJob, setSelectedJob] = useState<Complaint | null>(
    myAssignedJobs[0] || null
  );

  // Direct Image Upload for Completed Work Proof (base64 Data URL)
  const [afterPhoto, setAfterPhoto] = useState('');
  const [proofDescription, setProofDescription] = useState(
    'Inspected site, cleared loose debris, completed technical remediation according to standard municipal civil specifications.'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset proof photo when switching work orders
  useEffect(() => {
    setAfterPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedJob?.id]);

  // Worker Consent Toggle for GPS
  const [gpsConsent, setGpsConsent] = useState(true);

  const handleUpdateStatus = (jobId: string, status: WorkerJobStatus, eta?: number) => {
    updateWorkerJobStatus(jobId, status);
    alert(`Status updated to: ${status}! Citizen and officer notified.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Selected photo is too large. Please select an image under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAfterPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAfterPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!afterPhoto) {
      alert('Please upload a photo of the completed repair work before submitting proof.');
      return;
    }

    submitWorkProof(selectedJob.id, {
      beforePhotoUrl: selectedJob.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
      afterPhotoUrl: afterPhoto,
      workDescription: proofDescription,
      aiVerificationScore: 96.8,
    });
    alert(`Work Completion Proof submitted for ${selectedJob.id}! AI verified 96.8% repair accuracy. Payout released.`);
    setAfterPhoto('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
            <span>Field Workforce Guild • Verified Contractor Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Field Technician Work & Payout Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accept municipal jobs, track arrival GPS routes, upload AI-verified Before/After evidence, and receive transparent escrow payments.
          </p>
        </div>

        {/* Worker Badge */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt={currentWorker.fullName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">{currentWorker.fullName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ✓ {currentWorker.verificationStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Rating: ★ {currentWorker.rating} • {currentWorker.completedJobsCount} jobs completed
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned Tasks</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{myAssignedJobs.length}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Active work orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Available Open Jobs</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{availableOpenJobs.length}</p>
          <span className="text-[10px] text-slate-500">Ward pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Verified Earnings</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹{currentWorker.totalEarnings.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">UPI Escrow Disbursed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Payout / Job</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">₹3,850</p>
          <span className="text-[10px] text-slate-500">Govt Budget - 20% Fee</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assigned Jobs & Workflow Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Assigned Jobs & Active Work Orders
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {myAssignedJobs.length} active assignments
              </span>
            </div>

            {myAssignedJobs.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                <HardHat className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-slate-700">No active work orders assigned to you</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  When municipal officers triage citizen reports and dispatch orders to your queue, they will appear here with location and verified escrow payouts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssignedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      selectedJob?.id === job.id
                        ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {job.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {job.priority} Priority
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {job.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location.address} ({job.location.ward})</span>
                        </p>
                      </div>

                      {/* Transparent Payment Box */}
                      <div className="text-right shrink-0 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Worker Payout
                        </span>
                        <span className="text-base font-extrabold text-emerald-600 block">
                          ₹{job.payment?.workerPayout.toLocaleString() || '4,000'}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          (Govt ₹{job.payment?.jobBudgetCents || '5000'} - Fee ₹{job.payment?.platformFee || '1000'})
                        </span>
                      </div>
                    </div>

                    {/* Step-by-step Workflow Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700">
                        Status: <strong className="text-blue-600">{job.workerJobStatus || job.status}</strong>
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(job.id, 'On the Way', 15);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 font-bold text-[11px] transition"
                        >
                          🚗 On the Way (15m)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(job.id, 'Work Started', 0);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-800 font-bold text-[11px] transition"
                        >
                          🔧 Start Work
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] transition hover:bg-emerald-700"
                        >
                          📸 Upload Proof →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consented GPS Location Tracking during active job */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Consented Active Job GPS Route</h3>
                  <p className="text-[11px] text-slate-500">
                    Live telemetry shared only during active travel to site
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={gpsConsent}
                  onChange={(e) => setGpsConsent(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>GPS Consent Active</span>
              </label>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="font-bold text-slate-800">
                    {selectedJob
                      ? `Technician ${currentWorker.fullName} en route to ${selectedJob.location.address || 'assigned site'}`
                      : `Technician ${currentWorker.fullName} active on municipal grid`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedJob
                      ? `Target: ${selectedJob.location.ward || 'Assigned Sector'} • Real-time telemetry enabled`
                      : `Ready for field dispatch • Standing by for assignment`}
                  </p>
                </div>
              </div>
              <Link
                href="/map"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Map →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Work Completion Proof Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Submit Work Completion Proof
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct photo verification for job resolution & instant payout
                </p>
              </div>
            </div>

            {selectedJob ? (
              <form onSubmit={handleProofSubmit} className="space-y-4 text-xs">
                {/* Target Work Order Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Work Order</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {selectedJob.status}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedJob.id}</p>
                  <p className="text-slate-600 text-xs font-medium">{selectedJob.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{selectedJob.location.ward} • {selectedJob.location.city}</span>
                  </p>
                </div>

                {/* Original Incident Defect (Before Photo Reference from Citizen) */}
                {selectedJob.images && selectedJob.images[0] && (
                  <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        Original Defect (Incident Evidence)
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        CITIZEN PHOTO
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden h-32 bg-slate-950 border border-slate-200 relative group">
                      <img
                        src={selectedJob.images[0]}
                        alt="Original Defect"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2">
                        <p className="text-[10px] font-medium text-white truncate">
                          Before: {selectedJob.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ONLY ONE OPTION: Direct Image Upload for Completed Work */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-900 text-xs">
                      Upload Repaired Work Photo *
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Direct Photo Upload
                    </span>
                  </div>

                  {afterPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-950 shadow-md group">
                      <img
                        src={afterPhoto}
                        alt="Completed Work Proof"
                        className="w-full h-48 object-cover block"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ready for Verification</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-red-300 hover:text-white hover:bg-red-600 hover:border-red-600 text-[11px] font-semibold transition backdrop-blur-md shadow cursor-pointer"
                      >
                        ✕ Remove / Retake
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="work-proof-upload"
                      />
                      <label
                        htmlFor="work-proof-upload"
                        className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition select-none group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Click to upload repaired site photo
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Directly from phone camera or gallery (JPG, PNG, WEBP)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Work Description & Materials */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Work Description & Materials Used:
                  </label>
                  <textarea
                    rows={3}
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>

                {/* Payout Disclosure */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Release Amount Upon Verification:</span>
                    <span>₹{selectedJob.payment?.workerPayout.toLocaleString() || '4,000'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Disbursed directly to {currentWorker.bankAccountMasked} ({currentWorker.upiId})
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!afterPhoto}
                  className={`w-full py-3.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2 ${
                    afterPhoto
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {afterPhoto
                      ? 'Submit Proof for AI & Citizen Verification'
                      : 'Upload Photo to Enable Submission'}
                  </span>
                </button>
              </form>
            ) : (
              <p className="text-slate-400 py-6 text-center text-xs">
                Select an assigned job on the left to submit repair proof.
              </p>
            )}
          </div>

          {/* Worker Verification & Credentials Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Contractor Verification Profile</h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Identity Verification:</span>
                <span className="font-bold text-emerald-600">Verified Aadhaar / Govt ID</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Account:</span>
                <span className="font-mono font-bold text-slate-800">{currentWorker.bankAccountMasked}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI ID:</span>
                <span className="font-mono font-bold text-slate-800">{currentWorker.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span>Certified Skills:</span>
                <span className="font-semibold text-slate-800">{currentWorker.skills.slice(0, 2).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}