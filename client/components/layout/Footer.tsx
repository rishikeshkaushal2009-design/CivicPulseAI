import Link from 'next/link';
import { Activity, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-950 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="CivicPulse Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-slate-900 text-base">CivicPulse AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              "Connecting Citizens, Workers and Government for Smarter Cities"
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>National Smart City Standard</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Civic Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/report" className="hover:text-blue-600 transition">
                  Report Civic Issue (AI Vision)
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-blue-600 transition">
                  Track Complaint Timeline
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-blue-600 transition">
                  Civic Map & Hotspots
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition">
                  Role-Based Dashboards
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Transparency */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Transparency
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/funds" className="hover:text-blue-600 transition">
                  Public Funds & Project Tracker
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-blue-600 transition">
                  Predictive Civic Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-600 transition">
                  Platform Revenue & Admin Command
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Civic Health Index: 86/100 (Grade A)</span>
              </li>
            </ul>
          </div>

          {/* Workforce & Safety */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Field Workforce Guild
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/worker" className="hover:text-blue-600 transition">
                  Worker Job Portal & Proof
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Escrow Payout Guarantee</span>
              </li>
              <li>
                <span className="text-slate-500">Consented GPS Active Tracking</span>
              </li>
              <li>
                <span className="text-slate-500">Automated Before/After AI Scan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 CivicPulse AI. Production-Ready Civic Infrastructure Ecosystem.</p>
          <p className="flex items-center gap-1">
            Built for Smart Cities with AI Intelligence & Citizen Trust
          </p>
        </div>
      </div>
    </footer>
  );
}
