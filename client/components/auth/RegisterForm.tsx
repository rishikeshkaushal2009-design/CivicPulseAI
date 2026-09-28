"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  MapPin,
  Building2,
  HardHat,
  Shield,
  Compass,
  Activity,
  CheckCircle2,
  Briefcase,
  Search,
} from "lucide-react";
import { registerRealUser } from "@/lib/authService";
import { UserRole } from "@/types/civic";
import { lookupIndiaPincode, reverseGeocodeIndia } from "@/lib/indiaPincodeService";

const IndiaPincodeWardMap = dynamic(
  () => import("@/components/map/IndiaPincodeWardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs border border-slate-200">
        Loading India geospatial grid...
      </div>
    ),
  }
);

interface RoleOption {
  key: UserRole;
  title: string;
  badge: string;
  desc: string;
  targetRoute: string;
  icon: any;
  color: string;
  activeColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "citizen",
    title: "Citizen",
    badge: "Resident",
    desc: "Report local hazards, track live SLAs, and verify resolved issues in your neighborhood.",
    targetRoute: "/dashboard",
    icon: User,
    color: "border-slate-200 text-slate-700 bg-white hover:border-blue-300 hover:bg-blue-50/50",
    activeColor: "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-xs",
  },
  {
    key: "officer",
    title: "Municipal Officer",
    badge: "Triage & Dispatch",
    desc: "Review incoming AI reports, override routing, dispatch technicians, and manage ward SLAs.",
    targetRoute: "/officer",
    icon: Building2,
    color: "border-slate-200 text-slate-700 bg-white hover:border-purple-300 hover:bg-purple-50/50",
    activeColor: "border-purple-600 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20 shadow-xs",
  },
  {
    key: "worker",
    title: "Field Worker",
    badge: "Technician",
    desc: "Accept repair orders, verify location on-site, and upload Before/After photo proof.",
    targetRoute: "/worker",
    icon: HardHat,
    color: "border-slate-200 text-slate-700 bg-white hover:border-amber-300 hover:bg-amber-50/50",
    activeColor: "border-amber-600 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20 shadow-xs",
  },
  {
    key: "admin",
    title: "Platform Admin",
    badge: "Administrator",
    desc: "Platform administration, fraud shield telemetry, audit logs, and dual revenue management.",
    targetRoute: "/admin",
    icon: Shield,
    color: "border-slate-200 text-slate-700 bg-white hover:border-emerald-300 hover:bg-emerald-50/50",
    activeColor: "border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs",
  },
  {
    key: "dept_admin",
    title: "Commissioner",
    badge: "Urban Governance",
    desc: "City-wide civic health index, department performance leaderboards, and capital projects.",
    targetRoute: "/analytics",
    icon: Compass,
    color: "border-slate-200 text-slate-700 bg-white hover:border-indigo-300 hover:bg-indigo-50/50",
    activeColor: "border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs",
  },
];

const DEPARTMENTS = [
  "Roads & Infrastructure Department",
  "Sanitation & Solid Waste Management",
  "Electrical & Street Lighting Department",
  "Water Supply Department",
  "Drainage & Sewage Management Department",
  "Public Safety & Traffic Control",
];

const WORKER_SKILLS = [
  "Asphalt Paving & Roadwork",
  "Pothole Cold-Mix Patching",
  "Streetlight & Electrical Repair",
  "Sanitation & Solid Waste Clearance",
  "Drainage Culvert Jetting",
  "Water Pipeline Clamp & Plumbing",
  "Masonry & Pavement Curbing",
];

export default function RegisterForm() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic India Geospatial Location & Municipal Ward State
  const [pincode, setPincode] = useState("800020");
  const [city, setCity] = useState("Patna");
  const [stateName, setStateName] = useState("Bihar");
  const [wardNumber, setWardNumber] = useState(20);
  const [wardName, setWardName] = useState("Ashok Nagar (Patna)");
  const [ward, setWard] = useState("Ward 20 - Ashok Nagar (Patna)");
  const [localities, setLocalities] = useState<string[]>([
    "Ashok Nagar (Patna)",
    "Lohia Nagar",
    "Chitragupta Nagar",
    "Kankarbagh",
    "Dhelwan",
    "R.M.S. Colony",
    "West Lohianagar",
  ]);
  const [latitude, setLatitude] = useState(25.5933);
  const [longitude, setLongitude] = useState(85.1588);
  const [municipalityName, setMunicipalityName] = useState("Patna Municipal Corporation (PMC)");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>("✓ Patna Municipal Corporation • Bihar");

  // Other role attributes
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([WORKER_SKILLS[0], WORKER_SKILLS[1]]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lookup Indian PIN Code and update city, ward, state, and map coordinates
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setPincodeLoading(true);
      setPincodeMessage("🔍 Resolving India Postal Grid & Municipal Ward...");
      try {
        const res = await lookupIndiaPincode(clean);
        setCity(res.city);
        setStateName(res.state);
        setWardNumber(res.wardNumber);
        setWardName(res.wardName);
        setWard(res.fullWard);
        setLocalities(res.localities);
        setLatitude(res.latitude);
        setLongitude(res.longitude);
        setMunicipalityName(res.municipalityName);
        setPincodeMessage(`✓ ${res.municipalityName} • Ward ${res.wardNumber}`);
      } catch (err: any) {
        setPincodeMessage("Could not auto-resolve ward. You can type custom ward name.");
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeMessage(null);
    }
  };

  const handleQuickPinSelect = (quickPin: string) => {
    handlePincodeChange(quickPin);
  };

  // When citizen or officer clicks or drags on the India Map
  const handleMapClick = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setPincodeLoading(true);
    setPincodeMessage("🔍 Locating municipal ward on India map...");
    try {
      const geo = await reverseGeocodeIndia(lat, lng);
      if (geo.city) setCity(geo.city);
      if (geo.state) setStateName(geo.state);
      if (geo.pincode) setPincode(geo.pincode);
      if (geo.wardNumber) setWardNumber(geo.wardNumber);
      if (geo.wardName) setWardName(geo.wardName);
      if (geo.fullWard) setWard(geo.fullWard);
      if (geo.municipalityName) setMunicipalityName(geo.municipalityName);
      setPincodeMessage(`✓ Located: ${geo.city || "Urban Zone"}, ${geo.state || "India"} • ${geo.fullWard || ""}`);
    } catch (err) {
      console.warn("Reverse geocode warning:", err);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleLocalityChange = (chosenLocality: string) => {
    setWardName(chosenLocality);
    const updatedWard = `Ward ${wardNumber} - ${chosenLocality} (${city})`;
    setWard(updatedWard);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerRealUser({
        name: fullName,
        email,
        password,
        phone,
        role: selectedRole,
        ward,
        department: selectedRole === "officer" || selectedRole === "dept_admin" ? department : undefined,
        skills: selectedRole === "worker" ? selectedSkills : undefined,
        address: address || `${ward}, ${city}`,
        city,
        pincode,
      });

      if (!res.success) {
        setError(res.error || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      const activeConfig = ROLE_OPTIONS.find((r) => r.key === selectedRole) || ROLE_OPTIONS[0];
      setSuccessMsg(`Account created successfully as ${activeConfig.title}! Redirecting to portal...`);

      setTimeout(() => {
        router.push(activeConfig.targetRoute);
      }, 700);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto border border-slate-200 shadow-md shadow-slate-900/10 bg-slate-950 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="CivicPulse Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Your <span className="text-blue-600">CivicPulse AI</span> Account
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Register with your authorized municipal role to access your dedicated smart city command center
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-in fade-in">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT ROLE */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            1
          </span>
          <span>Select Account Role:</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRole === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedRole(opt.key)}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected ? opt.activeColor : opt.color
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-white/90 flex items-center justify-center shadow-2xs">
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight truncate">{opt.title}</p>
                  <p className="text-[10px] opacity-75 truncate">{opt.badge}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: ACCOUNT CREDENTIALS & DETAILS FORM */}
      <form onSubmit={handleRegister} className="space-y-4">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            2
          </span>
          <span>Personal &amp; Contact Credentials:</span>
        </label>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
          <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
            <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Email & Mobile Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
            <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <Phone className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 ml-1.5 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
            <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        {/* STEP 3: ROLE-SPECIFIC ATTRIBUTES */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          {/* ALL-INDIA GEOSPATIAL WARD & LOCATION PICKER COMPONENT */}
          {selectedRole !== "admin" && (
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/40 border border-blue-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>
                    {selectedRole === "citizen"
                      ? "Resident Municipal Ward & Geospatial Location"
                      : selectedRole === "worker"
                      ? "Field Technician Base Ward & Depot Location"
                      : "Officer Jurisdiction Ward & Headquarters"}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                  🇮🇳 Live India GIS &amp; Ward Resolver
                </span>
              </div>

              {/* PIN Code & Municipal Ward Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                {/* PIN Code Input (5 cols) */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="block font-bold text-slate-700">
                    Indian Postal PIN Code *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={pincode}
                      maxLength={6}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 800020"
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs"
                      required
                    />
                    {pincodeLoading && (
                      <div className="absolute right-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  {pincodeMessage && (
                    <p className="text-[10px] font-semibold text-blue-700 truncate">
                      {pincodeMessage}
                    </p>
                  )}
                </div>

                {/* Municipal Ward (7 cols) */}
                <div className="sm:col-span-7 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">
                      Municipal Ward &amp; Locality *
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Ward {wardNumber}
                    </span>
                  </div>

                  {localities.length > 1 ? (
                    <select
                      value={wardName}
                      onChange={(e) => handleLocalityChange(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {localities.map((loc) => (
                        <option key={loc} value={loc}>
                          Ward {wardNumber} - {loc} ({city})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="Ward 20 - Ashok Nagar (Patna)"
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Resolved Location Badge */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900">
                    {city}, {stateName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium truncate">
                    {municipalityName}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ward}
                </span>
              </div>

              {/* Interactive India Map */}
              <IndiaPincodeWardMap
                latitude={latitude}
                longitude={longitude}
                pincode={pincode}
                city={city}
                state={stateName}
                wardName={wardName}
                wardNumber={wardNumber}
                onMapClick={handleMapClick}
                onSelectQuickPin={handleQuickPinSelect}
              />
            </div>
          )}

          {/* CITIZEN ADDRESS */}
          {selectedRole === "citizen" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Street Address / Landmark
              </label>
              <div className="flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition">
                <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 302, FC Road / Ashok Nagar Main Road"
                  className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* OFFICER / COMMISSIONER DEPARTMENT */}
          {(selectedRole === "officer" || selectedRole === "dept_admin") && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsible Municipal Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* FIELD WORKER TRADE SKILLS */}
          {selectedRole === "worker" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Select Your Trade Skills &amp; Specialties:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WORKER_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                        isSelected
                          ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADMIN FIELDS */}
          {selectedRole === "admin" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Office</label>
              <input
                type="text"
                value="CivicPulse Central Administration HQ, India"
                readOnly
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 outline-none"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {loading ? (
            "Creating Real Account..."
          ) : successMsg ? (
            "Account Initialized!"
          ) : (
            <>
              <span>Complete Registration &amp; Open Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-1">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          Sign In to Your Account
        </Link>
      </p>
    </div>
  );
}