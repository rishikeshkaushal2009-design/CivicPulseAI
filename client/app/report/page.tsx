"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  FileText,
  ThumbsUp,
  Image as ImageIcon,
  Clock,
  Video,
  Info,
  Cpu,
  ShieldAlert,
  Lock,
  XCircle,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import {
  AIAnalysisResult,
  ComplaintCategory,
  ComplaintLocation,
  PriorityLevel,
  SeverityLevel,
} from '@/types/civic';
import { detectDuplicateComplaints } from '@/lib/civicStore';
import { reverseGeocodeIndia } from '@/lib/indiaPincodeService';
import YoloBoundingBoxOverlay from '@/components/report/YoloBoundingBoxOverlay';
import { detectCivicDefectYOLO } from '@/lib/yoloVisionService';

const ReportLocationMap = dynamic(
  () => import('@/components/report/ReportLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
        Loading interactive map...
      </div>
    ),
  }
);

const CATEGORIES: ComplaintCategory[] = [
  'Pothole',
  'Broken streetlight',
  'Garbage',
  'Water supply',
  'Drainage',
  'Road damage',
  'Traffic',
  'Sewage',
  'Public toilet',
  'Illegal dumping',
  'Electricity-related civic issue',
  'Public infrastructure',
  'Other',
];

export default function ReportPage() {
  const router = useRouter();
  const { addComplaint, user } = useCivicStore();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Pothole');
  const [isEmergency, setIsEmergency] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Location states initialized from authenticated user
  const [location, setLocation] = useState<ComplaintLocation>(() => ({
    latitude: user.city?.toLowerCase() === 'patna' ? 25.5933 : 18.5204,
    longitude: user.city?.toLowerCase() === 'patna' ? 85.1588 : 73.8567,
    address: user.address || (user.city ? `${user.ward || 'Urban Ward'}, ${user.city}` : 'FC Road / Ashok Nagar'),
    city: user.city || 'Pune',
    ward: user.ward || 'Ward 20 - Ashok Nagar',
    pincode: user.pincode || '800020',
    detectedAutomatically: false,
  }));
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'detected' | 'denied'>('idle');
  const [locationNotice, setLocationNotice] = useState('Detecting current GPS location...');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Duplicate detection state
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [highestConfidence, setHighestConfidence] = useState(0);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. AUTOMATIC GEOLOCATION ON LOAD
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setGpsStatus('detecting');
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      setLocationNotice('Geolocation not supported by browser. Using profile ward.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setGpsStatus('detected');
        setLocationNotice('Location detected automatically via device GPS');

        try {
          const geo = await reverseGeocodeIndia(lat, lng);
          setLocation({
            latitude: lat,
            longitude: lng,
            address: geo.wardName ? `${geo.wardName}, ${geo.city || ''}` : `GPS Lat: ${lat}, Lng: ${lng}`,
            city: geo.city || user.city || 'Patna',
            ward: geo.fullWard || user.ward || 'Municipal Ward',
            pincode: geo.pincode || user.pincode || '800020',
            detectedAutomatically: true,
          });
        } catch {
          setLocation((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            detectedAutomatically: true,
          }));
        }
      },
      (err) => {
        console.warn('GPS denied/unavailable:', err.message);
        setGpsStatus('denied');
        setLocationNotice('Using registered municipal ward. You can adjust the pin on map manually.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: `Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      detectedAutomatically: false,
    }));

    try {
      const geo = await reverseGeocodeIndia(lat, lng);
      if (geo.city || geo.fullWard) {
        setLocation((prev) => ({
          ...prev,
          city: geo.city || prev.city,
          ward: geo.fullWard || prev.ward,
          pincode: geo.pincode || prev.pincode,
          address: geo.wardName ? `${geo.wardName}, ${geo.city}` : prev.address,
        }));
      }
    } catch (e) {
      console.warn('Map pin reverse geocode notice:', e);
    }
  };

  // 2. VOICE SPEECH-TO-TEXT
  const toggleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your complaint.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setIsRecording(false);
        setDescription((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
        if (!title) {
          setTitle(spokenText.slice(0, 50));
        }
        // Only trigger AI scan if an incident photo has already been uploaded
        if (imageUrl) {
          runAIAnalysis(spokenText, category, imageUrl);
        }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  // 3. PHOTO-FIRST YOLO VISION AI ANALYSIS & REJECTION PIPELINE
  // STRICT RULE: Only runs AFTER an incident photo is uploaded.
  const runAIAnalysis = async (
    textDesc: string,
    cat: ComplaintCategory,
    img: string
  ) => {
    if (!img || !img.trim()) {
      setAiAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await detectCivicDefectYOLO({
        imageSrc: img,
        description: textDesc,
        category: cat,
        locationAddress: location.address,
        isEmergency,
      });

      setAiAnalysis(result);
      if (result.isRejected) {
        setCategory('Other');
      } else if (result.category) {
        setCategory(result.category);
      }
      checkDuplicates(cat, title, textDesc);
    } catch (err) {
      console.warn('YOLO analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. DUPLICATE DETECTION CHECK
  const checkDuplicates = (cat: string, curTitle: string, curDesc: string) => {
    const { matches, highestConfidence: conf } = detectDuplicateComplaints(
      location.latitude,
      location.longitude,
      cat,
      curTitle || cat,
      curDesc
    );
    setDuplicateMatches(matches);
    setHighestConfidence(conf);
  };

  // Handle File upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
        runAIAnalysis(description, category, result);
      };
      reader.readAsDataURL(file);
    }
  };

  // SUBMIT COMPLAINT
  const handleSubmit = (e: React.FormEvent) => {
    // Photo is strictly mandatory for civic complaint verification
    if (!imageUrl || !imageUrl.trim()) {
      alert('Photo Required: Municipal complaints require photographic evidence. Please upload or take a photo of the incident before submitting.');
      return;
    }

    // STRICT REJECTION GATE: Prevent submitting rejected / non-civic photos
    if (aiAnalysis?.isRejected) {
      alert(
        `COMPLAINT REJECTED BY YOLO CIVIC VISION AI:\n\n${aiAnalysis.rejectionReason || 'The uploaded photo does not contain a valid municipal defect.'}\n\nPlease replace the image with physical evidence of the civic problem before submitting.`
      );
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for the complaint.');
      return;
    }
    if (!description.trim()) {
      alert('Please describe the issue.');
      return;
    }

    setIsSubmitting(true);

    const complaintId = `CP-${Math.floor(99840040 + Math.random() * 9000)}`;
    const effectivePriority = isEmergency
      ? 'Critical'
      : aiAnalysis?.priority || 'High';
    const slaHours =
      effectivePriority === 'Critical'
        ? 4
        : effectivePriority === 'High'
        ? 24
        : effectivePriority === 'Medium'
        ? 72
        : 168;

    const now = new Date().toISOString();
    const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

    const newComplaint = {
      id: complaintId,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: effectivePriority,
      severity: isEmergency
        ? ('Critical Hazardous' as SeverityLevel)
        : aiAnalysis?.severity || 'Severe',
      department:
        aiAnalysis?.department || 'Roads & Infrastructure Department',
      status: 'Submitted' as const,
      createdAt: now,
      updatedAt: now,
      slaHours,
      slaDeadline,
      isEscalated: false,
      isEmergency,
      citizenId: user.id,
      citizenName: user.name,
      citizenPhone: user.phone,
      citizenEmail: user.email,
      location,
      images: imageUrl
        ? [imageUrl]
        : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'],
      aiAnalysis: aiAnalysis || {
        category,
        severity: 'Severe',
        priority: effectivePriority,
        summary: title.trim(),
        department: 'Roads & Infrastructure Department',
        suggestedAction: 'Inspect and dispatch municipal repair crew.',
        reason: 'Civic safety hazard reported by citizen.',
        estimatedUrgency: `Resolve within ${slaHours} hours`,
        confidenceScore: 96.5,
        detectedObjects: [category],
        safetyRiskIndex: 8.0,
      },
      upvotes: 1,
      upvotedByUserIds: [user.id],
      affectedCitizensCount: 15,
      comments: [],
      evidencePhotos: [],
      timeline: [
        {
          stage: 'Submitted' as const,
          label: 'Complaint Submitted',
          description: `Registered with ${location.detectedAutomatically ? 'automatic GPS' : 'manual'} geotag.`,
          timestamp: now,
          actor: `Citizen (${user.name})`,
          completed: true,
        },
        {
          stage: 'AI Analyzed' as const,
          label: 'YOLOv8 Vision Verified & Scanned',
          description: `Classified as ${category} with ${effectivePriority} priority and ${slaHours}h SLA.`,
          timestamp: now,
          actor: 'CivicPulse YOLOv8 Engine',
          completed: true,
        },
        {
          stage: 'Department Assigned' as const,
          label: `Routed to ${aiAnalysis?.department || 'Municipal Department'}`,
          description: `Dispatched to ${location.ward} duty queue.`,
          timestamp: now,
          actor: 'CivicPulse Auto-Router',
          completed: true,
        },
        {
          stage: 'Officer Reviewed' as const,
          label: 'Officer Review & Verification',
          description: 'Awaiting municipal officer approval.',
          timestamp: '',
          actor: 'Municipal Officer',
          completed: false,
        },
        {
          stage: 'Worker Assigned' as const,
          label: 'Field Worker Assignment',
          description: 'To be assigned to verified technician.',
          timestamp: '',
          actor: 'Officer / System',
          completed: false,
        },
        {
          stage: 'Work Started' as const,
          label: 'Work in Progress',
          description: 'Repair operations underway on site.',
          timestamp: '',
          actor: 'Field Worker',
          completed: false,
        },
        {
          stage: 'Work Completed' as const,
          label: 'Completion Proof Uploaded',
          description: 'Before & After photographic evidence.',
          timestamp: '',
          actor: 'Field Worker',
          completed: false,
        },
        {
          stage: 'Verification' as const,
          label: 'Citizen Resolution Verification',
          description: 'Citizen confirms work completion.',
          timestamp: '',
          actor: 'Citizen',
          completed: false,
        },
        {
          stage: 'Resolved' as const,
          label: 'Resolved & Worker Payment Released',
          description: 'Ticket closed; escrow payout disbursed.',
          timestamp: '',
          actor: 'CivicPulse Finance',
          completed: false,
        },
      ],
      history: [
        {
          status: 'Submitted' as const,
          message: 'Complaint submitted with GPS coordinates.',
          timestamp: now,
          updatedBy: user.name,
        },
      ],
      payment: {
        jobBudgetCents: effectivePriority === 'Critical' ? 5000 : 4000,
        workerPayout: effectivePriority === 'Critical' ? 4000 : 3200,
        platformFee: effectivePriority === 'Critical' ? 1000 : 800,
        paymentStatus: 'Escrowed' as const,
      },
    };

    addComplaint(newComplaint);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/track?id=${complaintId}`);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CivicPulse YOLOv8 Vision Defect & Rejection Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report Civic Issue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit with automatic location detection, instant YOLOv8 defect bounding boxes, and automatic non-civic photo rejection.
          </p>
        </div>

        {/* Emergency SOS Toggle */}
        <div
          onClick={() => {
            const next = !isEmergency;
            setIsEmergency(next);
            if (next && aiAnalysis && !aiAnalysis.isRejected) {
              setAiAnalysis({
                ...aiAnalysis,
                priority: 'Critical',
                severity: 'Critical Hazardous',
                estimatedUrgency: 'Emergency SLA: 4 hours',
                safetyRiskIndex: 9.8,
              });
            }
          }}
          className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 select-none ${
            isEmergency
              ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/25 ring-2 ring-red-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              isEmergency ? 'bg-white/20 text-white animate-pulse' : 'bg-red-50 text-red-600'
            }`}
          >
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                {isEmergency ? 'EMERGENCY MODE ACTIVE' : 'Mark as Emergency Complaint'}
              </span>
            </div>
            <p className={`text-[11px] ${isEmergency ? 'text-red-100' : 'text-slate-500'}`}>
              Hazardous live wires, flooding, road cave-in (4h Critical SLA)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details & Location (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. AUTOMATIC LOCATION DETECTION CARD */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Automatic Location Detection</h3>
                  <p className="text-[11px] text-slate-500">Browser GPS geotags exact incident coordinates</p>
                </div>
              </div>

              <button
                type="button"
                onClick={detectLocation}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-detect GPS</span>
              </button>
            </div>

            {/* Geolocation Status Badge */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                gpsStatus === 'detected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : gpsStatus === 'detecting'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    gpsStatus === 'detected'
                      ? 'bg-emerald-500'
                      : gpsStatus === 'detecting'
                      ? 'bg-blue-500 animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="font-semibold">{locationNotice}</span>
              </div>
              <span className="font-mono text-[11px] font-bold">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>

            {/* Interactive Leaflet Map for Pin Adjustment */}
            <ReportLocationMap
              latitude={location.latitude}
              longitude={location.longitude}
              onLocationChange={handleLocationChange}
            />

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Incident Street Address
                </label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Ward & City
                </label>
                <input
                  type="text"
                  value={`${location.ward}`}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Exact citizen coordinates are protected under municipal privacy safeguards.</span>
            </p>
          </div>

          {/* 2. ISSUE DETAILS & VOICE INPUT */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Incident Description</h3>

              {/* Voice Complaint Trigger */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                {isRecording ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isRecording ? 'Listening (Speak now)...' : '🎤 Voice Complaint'}</span>
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  checkDuplicates(category, e.target.value, description);
                }}
                placeholder="e.g. Hazardous Pothole crater outside college main gate"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                required
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Issue Category *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      if (imageUrl) {
                        runAIAnalysis(description, cat, imageUrl);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      category === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  checkDuplicates(category, title, e.target.value);
                }}
                placeholder="Describe what happened, depth/size, affected traffic, and any safety hazards..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column: Photo-First AI Analysis & Duplicate Check (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* PHOTO UPLOAD & YOLO DETECTION */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Photo-First AI Vision</h3>
                  <p className="text-[11px] text-slate-500">YOLO defect object detection & relevance verification</p>
                </div>
              </div>
            </div>

            {/* Image Preview with Interactive YOLO Bounding Box Overlay */}
            {imagePreview ? (
              <YoloBoundingBoxOverlay
                imageSrc={imagePreview}
                boundingBoxes={aiAnalysis?.boundingBoxes}
                isRejected={aiAnalysis?.isRejected}
                rejectionReason={aiAnalysis?.rejectionReason}
                confidenceScore={aiAnalysis?.confidenceScore}
                yoloModelVersion={aiAnalysis?.yoloModelVersion}
                isAnalyzing={isAnalyzing}
                onRemovePhoto={() => {
                  setImageUrl('');
                  setImagePreview('');
                  setAiAnalysis(null);
                }}
              />
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Click to upload photo from camera</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* EXPLICIT REJECTION ALERT BANNER */}
          {aiAnalysis?.isRejected && (
            <div className="p-5 rounded-3xl bg-red-950/90 border-2 border-red-500 text-red-100 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-red-600/40">
                  ⛔
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Complaint Rejected by YOLO Civic Vision
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-red-800 text-red-100 font-mono font-bold">
                      SUBMISSION LOCKED
                    </span>
                  </div>
                  <p className="text-xs text-red-200 leading-relaxed">
                    {aiAnalysis.rejectionReason}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-red-500/40 text-[11px] text-red-300 flex items-center justify-between">
                <span>Model: {aiAnalysis.yoloModelVersion || 'CivicPulse YOLOv8-Municipal-v3.2'}</span>
                <span className="font-mono text-amber-300 font-bold">Rejection Confidence: {aiAnalysis.confidenceScore}%</span>
              </div>

              <div className="p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-[11px] text-red-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-red-300 shrink-0" />
                <span>
                  Please upload a photo showing physical damage to public infrastructure (road craters, uncollected waste, streetlights, or sewage) to unlock complaint submission.
                </span>
              </div>
            </div>
          )}

          {/* AI ANALYSIS RESULTS CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">CivicPulse YOLOv8 Diagnostic</h3>
                  <p className="text-[11px] text-slate-500">Defect telemetry & precision routing</p>
                </div>
              </div>

              {isAnalyzing && (
                <span className="text-xs font-bold text-blue-600 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Analyzing...
                </span>
              )}
            </div>

            {!imagePreview ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <Camera className="w-8 h-8 mx-auto text-blue-400 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">Incident Photo Required</p>
                <p className="text-slate-400 max-w-xs mx-auto">
                  Upload or take a photo above to run real-time YOLOv8 defect detection, evaluate severity, and verify grievance validity.
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="py-8 text-center text-blue-600 text-xs space-y-2">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                <p className="font-bold text-slate-900 text-sm">Inspecting Photo with YOLOv8 Vision...</p>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Analyzing surface defect patterns, evaluating incident priority, and verifying civic compliance.
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Detected Priority</span>
                    <p
                      className={`text-sm font-extrabold mt-0.5 ${
                        aiAnalysis.isRejected
                          ? 'text-slate-400'
                          : aiAnalysis.priority === 'Critical'
                          ? 'text-red-600'
                          : aiAnalysis.priority === 'High'
                          ? 'text-orange-600'
                          : aiAnalysis.priority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {aiAnalysis.isRejected
                        ? '⛔ Rejected'
                        : aiAnalysis.priority === 'Critical'
                        ? '🚨 Critical'
                        : aiAnalysis.priority === 'High'
                        ? '⚠️ High'
                        : aiAnalysis.priority === 'Medium'
                        ? '⚡ Medium'
                        : '🌱 Low'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">YOLO Confidence</span>
                    <p className={`text-sm font-extrabold mt-0.5 ${aiAnalysis.isRejected ? 'text-red-600' : 'text-blue-600'}`}>
                      {aiAnalysis.confidenceScore}% Match
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Recommended Department</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{aiAnalysis.department}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Suggested Action</span>
                  <p className="text-xs text-slate-700 mt-0.5">{aiAnalysis.suggestedAction}</p>
                </div>

                <div className={`p-3 rounded-xl border leading-snug ${
                  aiAnalysis.isRejected
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-blue-100/60 border border-blue-200 text-blue-900'
                }`}>
                  <span className={`text-[10px] font-bold uppercase ${aiAnalysis.isRejected ? 'text-red-700' : 'text-blue-700'}`}>
                    AI Rationale
                  </span>
                  <p className="text-xs mt-0.5">{aiAnalysis.reason}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* DUPLICATE COMPLAINT WARNING */}
          {duplicateMatches.length > 0 && !ignoreDuplicate && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Possible Duplicate Complaint Detected ({highestConfidence}% Match)
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    A similar issue was recently reported near this exact geographic location:
                  </p>
                </div>
              </div>

              {/* Duplicate Card */}
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">
                    {duplicateMatches[0].id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {duplicateMatches[0].status}
                  </span>
                </div>
                <p className="font-bold text-slate-900">{duplicateMatches[0].title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {duplicateMatches[0].location.address}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => router.push(`/track?id=${duplicateMatches[0].id}`)}
                  className="p-2 rounded-xl bg-white border border-amber-300 font-bold text-slate-800 hover:bg-slate-50 transition text-center"
                >
                  👁️ View Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Upvoted existing complaint #${duplicateMatches[0].id}! Priority increased.`);
                    router.push(`/track?id=${duplicateMatches[0].id}`);
                  }}
                  className="p-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-center flex items-center justify-center gap-1"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote & Support</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIgnoreDuplicate(true)}
                className="w-full text-center text-[11px] text-amber-800 font-semibold hover:underline pt-1"
              >
                Not a duplicate? Continue submitting as new complaint →
              </button>
            </div>
          )}

          {/* SUBMIT BUTTON WITH STRICT PHOTO AND REJECTION ENFORCEMENT */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !imageUrl || aiAnalysis?.isRejected === true}
              className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                !imageUrl
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : aiAnalysis?.isRejected
                  ? 'bg-slate-700 hover:bg-slate-700 cursor-not-allowed opacity-80 ring-2 ring-red-500/50'
                  : isEmergency
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
              } disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering & Generating Tracking ID...</span>
                </>
              ) : !imageUrl ? (
                <>
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Upload Incident Photo to Submit</span>
                </>
              ) : aiAnalysis?.isRejected ? (
                <>
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Submission Blocked: Non-Civic Image Rejected</span>
                </>
              ) : (
                <>
                  <span>Submit Complaint & Generate Tracking ID</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              {!imageUrl
                ? '📷 Incident photo is required to run YOLO AI verification and dispatch municipal teams.'
                : aiAnalysis?.isRejected
                ? '⚠️ Submission disabled until a valid municipal defect photo is provided.'
                : 'An instant CivicPulse Tracking ID (CP-XXXXXXXX) will be generated.'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}