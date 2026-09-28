"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/lib/useCivicStore';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Building2,
  HardHat,
  Compass,
  CheckCircle2,
  Save,
  ArrowRight,
  Edit3,
  LogOut,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, updateUser, logout } = useCivicStore();

  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  // Edit form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [ward, setWard] = useState(user.ward || 'Ward 3 - Shivaji Nagar');
  const [city, setCity] = useState(user.city || 'Pune');
  const [address, setAddress] = useState(user.address || 'FC Road, Shivaji Nagar');
  const [pincode, setPincode] = useState(user.pincode || '411005');
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ward: ward.trim(),
      city: city.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      avatar,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('view');
    }, 1200);
  };

  const roleIconMap = {
    citizen: User,
    officer: Building2,
    worker: HardHat,
    admin: Shield,
    dept_admin: Compass,
  };

  const RoleIcon = roleIconMap[role] || User;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-slate-500">
            Manage your verified municipal identity and portal credentials
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-bold border border-slate-200">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'view' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setPhone(user.phone);
              setWard(user.ward || '');
              setAddress(user.address || '');
              setActiveTab('edit');
            }}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully! Active identity updated.</span>
        </div>
      )}

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <img
                src={user.avatar || PRESET_AVATARS[0]}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div className="text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide flex items-center gap-1">
                    <RoleIcon className="w-3.5 h-3.5" />
                    <span>{role.replace('_', ' ')}</span>
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {user.city || 'Pune'} • {user.ward || 'Central Municipal Zone'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Account (Sign Out)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                <p className="font-bold text-slate-900 text-sm">{user.email || 'Not configured'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Mobile Contact</span>
                <p className="font-bold text-slate-900 text-sm">{user.phone || 'Not configured'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Municipal Ward</span>
                <p className="font-bold text-slate-900 text-sm">{user.ward || 'All Wards'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Registered City &amp; PIN</span>
                <p className="font-bold text-slate-900 text-sm">
                  {user.city || 'Pune'} - {user.pincode || '411005'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Physical Address</span>
              <p className="font-semibold text-slate-800">{user.address || 'Address on file'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE VIEW */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Profile Information</h3>
            <p className="text-xs text-slate-500">
              Update your contact credentials and municipal details
            </p>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Profile Avatar</label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((avUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(avUrl)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition ${
                    avatar === avUrl ? 'border-blue-600 scale-105 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={avUrl} alt={`Avatar option ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500">
                <User className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
              <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500">
                <Phone className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Municipal Ward</label>
              <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500">
                <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full py-2.5 text-xs text-slate-900 bg-transparent outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}