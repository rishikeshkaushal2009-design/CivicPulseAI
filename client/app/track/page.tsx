"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Cpu,
  AlertTriangle,
  HardHat,
  ThumbsUp,
  MessageSquare,
  Camera,
  Share2,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Check,
  X,
  AlertOctagon,
  FileCheck2,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { Complaint } from '@/types/civic';
import YoloBoundingBoxOverlay from '@/components/report/YoloBoundingBoxOverlay';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'CP-99840040';

  const { complaints, upvoteComplaint, addComment, verifyResolution, user } = useCivicStore();
  const [searchId, setSearchId] = useState(initialId);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [commentText, setCommentText] = useState('');
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);

  useEffect(() => {
    const idFromParam = searchParams.get('id');
    const target = idFromParam || searchId;
    const found = complaints.find(
      (c) => c.id.toLowerCase() === target.trim().toLowerCase()
    );
    setSelectedComplaint(found || complaints[0] || null);
    if (idFromParam) {
      setSearchId(idFromParam);
    }
  }, [searchParams, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchId.trim().toUpperCase();
    const found = complaints.find(
      (c) => c.id.toLowerCase() === clean.toLowerCase()
    );
    setSelectedComplaint(found || null);
  };

  const calculateSlaRemaining = (deadlineStr: string) => {
    const remainingMs = new Date(deadlineStr).getTime() - Date.now();
    if (remainingMs <= 0) return { text: 'SLA Overdue', expired: true };
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}h ${mins}m remaining`, expired: false };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>CivicPulse Live 10-Stage Audit Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Complaint Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stage progression, AI diagnostic summary, assigned technician telemetry, and verification proof.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. CP-99840040)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:border-blue-500 outline-none shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shrink-0"
          >
            Track
          </button>
        </form>
      </div>

      {/* Quick Complaint Switcher Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold scrollbar-none">
        <span className="text-slate-400 shrink-0">Sample Tickets:</span>
        {complaints.slice(0, 5).map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSearchId(c.id);
              setSelectedComplaint(c);
            }}
            className={`px-3 py-1.5 rounded-xl border shrink-0 transition flex items-center gap-1.5 ${
              selectedComplaint?.id === c.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-mono">{c.id}</span>
            <span className="opacity-75">({c.category})</span>
          </button>
        ))}
      </div>

      {/* Main Complaint Tracker Card */}
      {selectedComplaint ? (
        <div className="space-y-8">
          {/* Top Status Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    {selectedComplaint.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedComplaint.priority === 'Critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : selectedComplaint.priority === 'High'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    🚨 {selectedComplaint.priority} Priority
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {selectedComplaint.category}
                  </span>
                  {selectedComplaint.isEscalated && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" />
                      Escalated to Commissioner
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {selectedComplaint.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedComplaint.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <strong>{selectedComplaint.location.address}</strong> ({selectedComplaint.location.ward})
                  </span>
                  <span>•</span>
                  <span>Reported on: {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* SLA & Status Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shrink-0 md:w-64 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Lifecycle Stage</span>
                <p className="text-base font-extrabold text-blue-600">{selectedComplaint.status}</p>

                <div className="pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span>SLA Window:</span>
                    <span className="font-bold text-slate-800">{selectedComplaint.slaHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Deadline:</span>
                    <span
                      className={`font-bold ${
                        calculateSlaRemaining(selectedComplaint.slaDeadline).expired
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {calculateSlaRemaining(selectedComplaint.slaDeadline).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Image Preview with YOLO Bounding Box Overlay */}
            {selectedComplaint.images && selectedComplaint.images[0] && (
              selectedComplaint.aiAnalysis?.boundingBoxes && selectedComplaint.aiAnalysis.boundingBoxes.length > 0 ? (
                <YoloBoundingBoxOverlay
                  imageSrc={selectedComplaint.images[0]}
                  boundingBoxes={selectedComplaint.aiAnalysis.boundingBoxes}
                  confidenceScore={selectedComplaint.aiAnalysis.confidenceScore}
                  yoloModelVersion={selectedComplaint.aiAnalysis.yoloModelVersion}
                />
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-900 border border-slate-200">
                  <img
                    src={selectedComplaint.images[0]}
                    alt="Incident"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Citizen Photographic Evidence</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-blue-600/90 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Confidence: {selectedComplaint.aiAnalysis?.confidenceScore}%</span>
                  </div>
                </div>
              )
            )}

            {/* AI Diagnostics Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>CivicPulse AI Diagnostic Findings</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Recommended Department:</span>
                  <p className="font-bold text-slate-900">{selectedComplaint.department}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Severity Index:</span>
                  <p className="font-bold text-red-700">{selectedComplaint.severity}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Suggested Action:</span>
                  <p className="font-bold text-slate-900">
                    {selectedComplaint.aiAnalysis?.suggestedAction}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 border-t border-blue-200/60 pt-2">
                <strong>Safety Rationale:</strong> {selectedComplaint.aiAnalysis?.reason}
              </p>
            </div>
          </div>

          {/* 10-Stage Visual Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">10-Stage Lifecycle Timeline</h3>
                <p className="text-xs text-slate-500">
                  Every stage timestamped and verified by municipal smart contracts
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Audited Flow
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
              {selectedComplaint.timeline.map((step, idx) => {
                const isCurrent = selectedComplaint.status === step.stage;
                return (
                  <div key={idx} className="relative flex items-start gap-4 group">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 border-2 transition ${
                        step.completed
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : isCurrent
                          ? 'bg-white text-blue-600 border-blue-600 ring-4 ring-blue-100'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      {step.completed ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div className="flex-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4
                          className={`text-sm font-bold ${
                            step.completed
                              ? 'text-slate-900'
                              : isCurrent
                              ? 'text-blue-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {step.timestamp && (
                          <span className="text-[11px] font-medium text-slate-500">
                            {new Date(step.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">{step.description}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Actor: {step.actor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Field Worker & Live Telemetry Card */}
          {selectedComplaint.assignedWorkerName && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Assigned Field Technician</h3>
                    <p className="text-[11px] text-slate-500">Consented GPS live assignment telemetry</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {selectedComplaint.workerJobStatus || 'Assigned'}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Technician Name</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedComplaint.assignedWorkerName}
                  </p>
                  <p className="text-[11px] text-slate-500">Verified Road Specialist (Rating: 4.9)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Estimated Arrival (ETA)</span>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">
                    {selectedComplaint.workerEtaMinutes !== undefined
                      ? `${selectedComplaint.workerEtaMinutes} minutes`
                      : 'Arrived on Site'}
                  </p>
                  <p className="text-[11px] text-slate-500">Real-time route calculated</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Worker Escrow Payout</span>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    ₹{selectedComplaint.payment.workerPayout.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Status: {selectedComplaint.payment.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Work Completion Proof & Citizen Verification Card */}
          {selectedComplaint.resolutionProof && (
            <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Work Completion Proof (AI Verified)</h3>
                    <p className="text-[11px] text-slate-500">
                      Before & After comparative photographic scan
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  AI Match: {selectedComplaint.resolutionProof.aiVerificationScore}%
                </span>
              </div>

              {/* Before / After Photo Comparison */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 mb-1.5 block">BEFORE REPAIR</span>
                  <div className="rounded-2xl overflow-hidden h-44 bg-slate-900 border border-slate-200">
                    <img
                      src={selectedComplaint.resolutionProof.beforePhotoUrl}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 mb-1.5 block">AFTER REPAIR</span>
                  <div className="rounded-2xl overflow-hidden h-44 bg-slate-900 border border-slate-200">
                    <img
                      src={selectedComplaint.resolutionProof.afterPhotoUrl}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800">Technician Work Description:</p>
                <p className="text-slate-600">{selectedComplaint.resolutionProof.workDescription}</p>
                <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                  ✓ {selectedComplaint.resolutionProof.aiVerificationSummary}
                </p>
              </div>

              {/* Citizen Verification Prompt (Actionable for citizen!) */}
              {!selectedComplaint.citizenVerification?.isConfirmed && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                  <h4 className="text-xs font-bold text-blue-900">
                    Citizen Verification Required: Confirm Resolution
                  </h4>
                  <p className="text-xs text-blue-800">
                    Has the issue at {selectedComplaint.location.address} been satisfactorily repaired?
                  </p>

                  {showReworkInput && (
                    <textarea
                      rows={2}
                      value={verifyFeedback}
                      onChange={(e) => setVerifyFeedback(e.target.value)}
                      placeholder="Explain why rework is required (e.g. asphalt still uneven)..."
                      className="w-full p-2.5 text-xs bg-white rounded-xl border border-slate-300 outline-none"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        verifyResolution(selectedComplaint.id, true, 'Confirmed resolved by citizen.');
                        alert('Thank you! Complaint marked RESOLVED and worker payout released.');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Resolved</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!showReworkInput) {
                          setShowReworkInput(true);
                        } else {
                          verifyResolution(selectedComplaint.id, false, verifyFeedback);
                          alert('Complaint marked Rework Required. Municipal officer notified.');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Report Incomplete Work</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedComplaint.citizenVerification?.isConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Verification Confirmed • Ticket Successfully Closed</span>
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Payout ₹{selectedComplaint.payment.workerPayout} Released
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Community Support & Upvoting */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Community Support & Discussion</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedComplaint.affectedCitizensCount} estimated citizens affected by this issue
                </p>
              </div>

              <button
                onClick={() => upvoteComplaint(selectedComplaint.id)}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition flex items-center gap-2 border border-blue-200"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Upvote ({selectedComplaint.upvotes})</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {selectedComplaint.comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No citizen comments yet. Be the first to add evidence!</p>
              ) : (
                selectedComplaint.comments.map((comm) => (
                  <div key={comm.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{comm.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comm.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600">{comm.text}</p>
                  </div>
                ))
              )}

              {/* Add Comment Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commentText.trim()) {
                    addComment(selectedComplaint.id, commentText);
                    setCommentText('');
                  }
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add community observation or extra evidence..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find a complaint matching "{searchId}". Please check the ID or choose one of our demo tickets above.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-xs">
          Loading CivicPulse tracking details...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}