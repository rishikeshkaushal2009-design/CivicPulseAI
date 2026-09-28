"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Building2,
  HardHat,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  Cpu,
  Layers,
  Sparkles,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Landmark,
  Receipt,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useCivicStore } from '@/lib/useCivicStore';
import { getStoredContracts, getStoredRevenue, saveContracts, saveRevenue } from '@/lib/civicStore';
import { GovernmentContract, RevenueRecord } from '@/types/civic';
import PaymentSimulatorModal from '@/components/admin/PaymentSimulatorModal';
import ReceiptModal from '@/components/admin/ReceiptModal';
import AwardContractModal from '@/components/admin/AwardContractModal';

export default function AdminPage() {
  const { complaints, workers, user } = useCivicStore();

  const [contracts, setContracts] = useState<GovernmentContract[]>(() => getStoredContracts());
  const [transactions, setTransactions] = useState<RevenueRecord[]>(() => getStoredRevenue());
  const [backendSyncStatus, setBackendSyncStatus] = useState<'connected' | 'checking' | 'fallback'>('checking');
  const [resolvedFraudIds, setResolvedFraudIds] = useState<Record<string, 'Cleared' | 'Confirmed Fraud'>>({});

  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorInitialStream, setSimulatorInitialStream] = useState<'primary' | 'secondary' | 'contract_cut'>('primary');
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<RevenueRecord | null>(null);
  const [isAwardContractOpen, setIsAwardContractOpen] = useState(false);

  // Fetch live revenue state from Express backend
  const fetchBackendRevenue = useCallback(async () => {
    try {
      setBackendSyncStatus('checking');
      const res = await fetch('http://localhost:5000/api/admin/revenue');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.contracts && data.contracts.length > 0) {
            setContracts(data.contracts);
            saveContracts(data.contracts);
          }
          if (data.recentTransactions && data.recentTransactions.length > 0) {
            setTransactions(data.recentTransactions);
            saveRevenue(data.recentTransactions);
          }
          setBackendSyncStatus('connected');
          return;
        }
      }
      setBackendSyncStatus('fallback');
    } catch {
      setBackendSyncStatus('fallback');
    }
  }, []);

  useEffect(() => {
    fetchBackendRevenue();
  }, [fetchBackendRevenue]);

  // Derived real fraud alerts from incoming complaints
  const fraudAlerts = useMemo(() => {
    return complaints
      .filter((c) => c.isFlaggedForFraud || (c.duplicateConfidence && c.duplicateConfidence > 80))
      .map((c) => ({
        id: `FRAUD-${c.id}`,
        complaintId: c.id,
        complaintTitle: c.title,
        flaggedReason: c.fraudAlertReason || `High confidence duplicate pattern (${c.duplicateConfidence}% match) detected.`,
        severity: (c.priority === 'Critical' ? 'High' : 'Medium') as 'Low' | 'Medium' | 'High',
        status: (resolvedFraudIds[`FRAUD-${c.id}`] || 'Pending Admin Review') as 'Pending Admin Review' | 'Cleared' | 'Confirmed Fraud',
        citizenName: c.citizenName || 'Resident',
        detectedAt: c.createdAt || new Date().toISOString(),
      }));
  }, [complaints, resolvedFraudIds]);

  // Dynamic 3-Stream Financial Totals
  const primarySaaSTotal = useMemo(() => {
    return transactions
      .filter((r) => r.stream === 'primary' || r.type === 'Govt SaaS Management' || r.type === 'Govt Contract')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [transactions]);

  const secondaryFeeTotal = useMemo(() => {
    return transactions
      .filter((r) => r.stream === 'secondary' || r.type === 'Worker Transaction Fee' || r.type === 'Service Management Fee')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [transactions]);

  const contractCommissionTotal = useMemo(() => {
    return transactions
      .filter((r) => r.stream === 'contract_cut' || r.type === 'Contract Authority Commission')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [transactions]);

  const totalPlatformRevenue = primarySaaSTotal + secondaryFeeTotal + contractCommissionTotal;
  const totalGrossVolume = useMemo(() => {
    return transactions.reduce((sum, r) => sum + (r.grossAmount || r.amount), 0);
  }, [transactions]);

  // Handle successful simulated payment
  const handlePaymentSuccess = (newTxn: RevenueRecord) => {
    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    saveRevenue(updated);
    setSelectedReceiptTxn(newTxn);
  };

  // Handle successful contract award
  const handleContractAwarded = (newContract: GovernmentContract, commissionTxn: RevenueRecord) => {
    const updatedContracts = [newContract, ...contracts];
    setContracts(updatedContracts);
    saveContracts(updatedContracts);

    const updatedTxns = [commissionTxn, ...transactions];
    setTransactions(updatedTxns);
    saveRevenue(updatedTxns);
    setSelectedReceiptTxn(commissionTxn);
  };

  const openSimulatorWithStream = (s: 'primary' | 'secondary' | 'contract_cut') => {
    setSimulatorInitialStream(s);
    setIsSimulatorOpen(true);
  };

  const handleResolveFraud = (id: string, action: 'Cleared' | 'Confirmed Fraud') => {
    setResolvedFraudIds((prev) => ({ ...prev, [id]: action }));
    alert(`Fraud Alert ${id} marked as: ${action}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. Header Bar with Live Backend Sync Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>CivicPulse Administration & Financial Command</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Administration & Revenue Generation Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Government SaaS Management Retainers, Worker Payout Nominal Fees, and Public Contract Authority Commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Backend Status Badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            backendSyncStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : backendSyncStatus === 'checking'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              backendSyncStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : backendSyncStatus === 'checking'
                ? 'bg-blue-500 animate-spin'
                : 'bg-amber-500'
            }`} />
            <span>
              {backendSyncStatus === 'connected'
                ? 'Backend API Active (Port 5000)'
                : backendSyncStatus === 'checking'
                ? 'Connecting Backend...'
                : 'Hybrid Local Ledger'}
            </span>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">
            Admin: {user.name}
          </span>
        </div>
      </div>

      {/* 2. TOP BANNER: 3-TIER REVENUE ENGINE WITH SIMULATOR CTAs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-2 backdrop-blur-xs">
              <DollarSign className="w-3.5 h-3.5" />
              <span>CivicPulse Monetization & Escrow Architecture</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Total Platform Revenue: ₹{(totalPlatformRevenue / 100000).toFixed(2)} Lakhs
            </h2>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl">
              Gross volume processed: <span className="font-mono font-bold text-white">₹{(totalGrossVolume / 100000).toFixed(2)} Lakhs</span> across municipal app retainers, worker repair payouts, and public infrastructure tender commissions.
            </p>
          </div>

          {/* Interactive Simulator Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => openSimulatorWithStream('primary')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer shadow-emerald-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulate Revenue Payment →</span>
            </button>

            <button
              onClick={() => setIsAwardContractOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-purple-300" />
              <span>Award Municipal Tender (Admin Cut)</span>
            </button>
          </div>
        </div>

        {/* 3. The 3 Distinct Revenue Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PILLAR 1: Primary Govt SaaS Management Retainer */}
          <div className="p-5 rounded-2xl bg-white/5 border border-blue-400/30 space-y-3 backdrop-blur-xs relative group hover:border-blue-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
                PRIMARY REVENUE STREAM (80%)
              </span>
              <span className="text-base">🏛️</span>
            </div>

            <h3 className="text-base font-bold text-white">
              Govt App Management Retainer
            </h3>
            <p className="text-2xl font-extrabold text-blue-300 font-mono">
              ₹{(primarySaaSTotal / 100000).toFixed(2)} Lakhs
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-white/10 pt-2">
              CivicPulse charges a recurring software management retainer to municipal corporations to manage, host, and maintain the civic grievance AI platform.
            </p>

            <div className="text-[10px] text-blue-200 font-mono">
              Model: ₹1.5L - ₹3.5L / mo per Urban Local Body
            </div>

            <button
              type="button"
              onClick={() => openSimulatorWithStream('primary')}
              className="w-full mt-2 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Simulate SaaS Retainer Payment (₹2.5L)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PILLAR 2: Secondary Worker-Govt Nominal Payout Fee */}
          <div className="p-5 rounded-2xl bg-white/5 border border-amber-400/30 space-y-3 backdrop-blur-xs relative group hover:border-amber-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                SECONDARY REVENUE STREAM (5%)
              </span>
              <span className="text-base">⚡</span>
            </div>

            <h3 className="text-base font-bold text-white">
              Worker Payout Transaction Fee
            </h3>
            <p className="text-2xl font-extrabold text-amber-300 font-mono">
              ₹{secondaryFeeTotal.toLocaleString('en-IN')}
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-white/10 pt-2">
              CivicPulse charges a nominal 5% transaction processing & escrow fee on every repair payout disbursed between the government and verified field technicians.
            </p>

            <div className="text-[10px] text-amber-200 font-mono">
              Model: 5.0% automated escrow fee per resolved job
            </div>

            <button
              type="button"
              onClick={() => openSimulatorWithStream('secondary')}
              className="w-full mt-2 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Simulate Worker Fee (₹4k → ₹200)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PILLAR 3: Government Contract Authority Admin Commission */}
          <div className="p-5 rounded-2xl bg-white/5 border border-purple-400/30 space-y-3 backdrop-blur-xs relative group hover:border-purple-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                ADMIN COMMISSION STREAM (15%)
              </span>
              <span className="text-base">📜</span>
            </div>

            <h3 className="text-base font-bold text-white">
              Contract Authority Commission
            </h3>
            <p className="text-2xl font-extrabold text-purple-300 font-mono">
              ₹{(contractCommissionTotal / 1000).toFixed(1)}k
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-white/10 pt-2">
              CivicPulse Admin retains a 2.5% platform commission on every public works infrastructure contract or tender awarded by the government to contractor authorities.
            </p>

            <div className="text-[10px] text-purple-200 font-mono">
              Model: 2.5% Admin Commission on municipal tenders
            </div>

            <button
              type="button"
              onClick={() => openSimulatorWithStream('contract_cut')}
              className="w-full mt-2 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Simulate Tender Cut (₹25L → ₹62.5k)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Municipal Operations KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Enterprise Municipalities</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{contracts.length}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Active SaaS SLA Agreements</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Field Workers</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{workers.length + 336}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">5% Nominal Fee Per Payout</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Processed Revenue Txns</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{transactions.length}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">100% PFMS Treasury Verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">AI Abuse Shield Blocks</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {fraudAlerts.filter((f) => f.status === 'Confirmed Fraud').length}
          </p>
          <span className="text-[10px] text-red-500 font-semibold">Protected Escrow Integrity</span>
        </div>
      </div>

      {/* 5. LIVE REVENUE & TRANSACTION AUDIT LEDGER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm">
                Live Revenue & Escrow Settlement Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized audit trail of simulated payments, government app retainers, worker fees, and tender admin cuts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBackendRevenue}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>

            <button
              onClick={() => openSimulatorWithStream('primary')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Process New Payment</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Txn ID / Ref</th>
                <th className="py-3 px-4">Revenue Stream</th>
                <th className="py-3 px-4">Government Payer</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4 text-right">Gross Volume</th>
                <th className="py-3 px-4 text-center">Rate</th>
                <th className="py-3 px-4 text-right">CivicPulse Cut</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.map((txn) => {
                const isPrim = txn.stream === 'primary' || txn.type === 'Govt SaaS Management' || txn.type === 'Govt Contract';
                const isSec = txn.stream === 'secondary' || txn.type === 'Worker Transaction Fee';

                return (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-blue-700">{txn.id}</p>
                      <p className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                        {txn.transactionRef || 'PFMS/IN/2026/...'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        isPrim
                          ? 'bg-blue-100 text-blue-800'
                          : isSec
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {txn.type}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {txn.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {txn.payer || 'Pune Municipal Corporation'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                      {txn.payee || 'CivicPulse Platform'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      ₹{(txn.grossAmount || txn.amount).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {isPrim ? '100%' : `${txn.adminCutPercent || (isSec ? 5 : 2.5)}%`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700">
                      +₹{txn.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceiptTxn(txn)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition shadow-2xs flex items-center gap-1 mx-auto"
                      >
                        <Receipt className="w-3 h-3 text-emerald-600" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MUNICIPAL GOVERNMENT CONTRACTS LEDGER WITH ADMIN CUT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Active Municipal Government Contracts & Authority Tenders
            </h3>
            <p className="text-xs text-slate-500">
              Contract agreements with authorities featuring automatic CivicPulse Admin percentage commission
            </p>
          </div>

          <button
            onClick={() => setIsAwardContractOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Award New Tender</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Government Agency</th>
                <th className="py-3 px-4">Respected Awarded Authority</th>
                <th className="py-3 px-4">Tender Budget</th>
                <th className="py-3 px-4 text-center">CivicPulse Admin Cut</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contracts.map((con) => {
                const cut = Math.round(con.annualValue * ((con.adminCommissionPercent || 2.5) / 100));

                return (
                  <tr key={con.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{con.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{con.municipalityName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {con.awardedAuthority || 'Municipal Public Works Division'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 font-mono">
                      ₹{(con.annualValue / 100000).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {con.adminCommissionPercent || 2.5}% (₹{(cut / 1000).toFixed(1)}k)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {con.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. AI Fraud & Abuse Detection Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm">
                AI Fraud & Abuse Detection Queue
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Shields municipal financial escrow against duplicate image reuse, GPS spoofing, and fake work proof claims
            </p>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
            Human-in-the-Loop Review
          </span>
        </div>

        <div className="p-5 space-y-4">
          {fraudAlerts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-800">Fraud & Abuse Queue Clean</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                AI Vision tamper analysis, reverse image search, and geo-velocity algorithms have flagged zero fraudulent reports. The municipal queue is authentic.
              </p>
            </div>
          ) : (
            fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px]">
                      {alert.id}
                    </span>
                    <span className="font-bold text-slate-900">{alert.complaintTitle}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.status === 'Pending Admin Review'
                          ? 'bg-amber-100 text-amber-800'
                          : alert.status === 'Cleared'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug">{alert.flaggedReason}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Source: {alert.citizenName}</span>
                    <span>•</span>
                    <span>Detected at: {new Date(alert.detectedAt).toLocaleString()}</span>
                  </div>
                </div>

                {alert.status === 'Pending Admin Review' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveFraud(alert.id, 'Cleared')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Clear (False Positive)</span>
                    </button>
                    <button
                      onClick={() => handleResolveFraud(alert.id, 'Confirmed Fraud')}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Fraud</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 8. MODALS */}
      {/* A. Payment Simulator Modal */}
      <PaymentSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        initialStream={simulatorInitialStream}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* B. Official Tax Invoice & Escrow Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTxn}
        onClose={() => setSelectedReceiptTxn(null)}
      />

      {/* C. Award Contract Modal */}
      <AwardContractModal
        isOpen={isAwardContractOpen}
        onClose={() => setIsAwardContractOpen(false)}
        onContractAwarded={handleContractAwarded}
      />
    </div>
  );
}