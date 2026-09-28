"use client";

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  HardHat,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { RevenueRecord, RevenueStreamType } from '@/types/civic';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (newTxn: RevenueRecord) => void;
  initialStream?: 'primary' | 'secondary' | 'contract_cut';
}

export default function PaymentSimulatorModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  initialStream = 'primary',
}: PaymentSimulatorModalProps) {
  const [stream, setStream] = useState<'primary' | 'secondary' | 'contract_cut'>(initialStream);
  const [payer, setPayer] = useState('Pune Municipal Corporation (PMC)');
  const [grossAmount, setGrossAmount] = useState<number>(() => {
    if (initialStream === 'secondary') return 4000;
    if (initialStream === 'contract_cut') return 2500000;
    return 250000;
  });
  const [paymentMethod, setPaymentMethod] = useState('PFMS Treasury Direct Debit');
  const [authorityName, setAuthorityName] = useState('M/S Larsen Infra Ltd (Roads Authority)');
  const [workerName, setWorkerName] = useState('Technician Utsav Kumar (Civil Guild)');
  const [customPercent, setCustomPercent] = useState<number>(() => {
    if (initialStream === 'secondary') return 5.0;
    if (initialStream === 'contract_cut') return 2.5;
    return 100;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  if (!isOpen) return null;

  // Stream-specific presets & defaults
  const handleSelectStream = (newStream: 'primary' | 'secondary' | 'contract_cut') => {
    setStream(newStream);
    if (newStream === 'primary') {
      setGrossAmount(250000);
      setCustomPercent(100);
      setPaymentMethod('PFMS Treasury Direct Debit');
    } else if (newStream === 'secondary') {
      setGrossAmount(4000);
      setCustomPercent(5.0);
      setPaymentMethod('CivicPulse Automated Worker Escrow Payout');
    } else {
      setGrossAmount(2500000);
      setCustomPercent(2.5);
      setPaymentMethod('Treasury Project Escrow Account');
    }
  };

  // Calculations
  const calculatedCivicCut =
    stream === 'primary'
      ? grossAmount
      : Math.round(grossAmount * (customPercent / 100));

  const recipientAllocation =
    stream === 'primary' ? 0 : grossAmount - calculatedCivicCut;

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setProcessingStep(1);

    // Simulate animated 4-stage banking steps
    setTimeout(() => setProcessingStep(2), 500);
    setTimeout(() => setProcessingStep(3), 1000);
    setTimeout(() => setProcessingStep(4), 1400);

    setTimeout(async () => {
      let finalTxn: RevenueRecord;

      try {
        // Call Express backend endpoint
        const res = await fetch('http://localhost:5000/api/admin/simulate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamType: stream,
            grossAmount,
            payer,
            payee:
              stream === 'primary'
                ? 'CivicPulse AI Technologies'
                : stream === 'secondary'
                ? workerName
                : authorityName,
            authorityName,
            paymentMethod,
            customPercent,
            description:
              stream === 'primary'
                ? `Municipal SaaS AI App Management Retainer (${payer})`
                : stream === 'secondary'
                ? `Work Order Payout Settlement (${customPercent}% Platform Fee)`
                : `Tender Award Platform Commission: ${authorityName} (${customPercent}%)`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.transaction) {
            finalTxn = data.transaction;
          } else {
            throw new Error('Backend returned unexpected format');
          }
        } else {
          throw new Error('Backend HTTP error');
        }
      } catch (err) {
        console.warn('Backend unavailable, generating verified local simulated receipt:', err);
        // Fallback local transaction creation
        const randId = Math.floor(100000 + Math.random() * 900000);
        finalTxn = {
          id: `TXN-CP-${Date.now().toString().slice(-6)}`,
          type:
            stream === 'primary'
              ? 'Govt SaaS Management'
              : stream === 'secondary'
              ? 'Worker Transaction Fee'
              : 'Contract Authority Commission',
          stream,
          description:
            stream === 'primary'
              ? `Municipal SaaS AI App Management Retainer (${payer})`
              : stream === 'secondary'
              ? `Work Order Payout Settlement (${customPercent}% Platform Fee)`
              : `Tender Award Platform Commission: ${authorityName} (${customPercent}%)`,
          amount: calculatedCivicCut,
          grossAmount,
          adminCutPercent: customPercent,
          payer,
          payee:
            stream === 'primary'
              ? 'CivicPulse AI Technologies'
              : stream === 'secondary'
              ? workerName
              : authorityName,
          paymentMethod,
          transactionRef: `PFMS/IN/${new Date().getFullYear()}/${randId}`,
          invoiceId: `INV-CP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString(),
          status: 'Settled',
        };
      }

      setIsProcessing(false);
      onPaymentSuccess(finalTxn);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Simulate Municipal Payment & Revenue Flow</h3>
              <p className="text-[11px] text-slate-300">
                Interactive demonstration of CivicPulse primary, secondary, and tender commission revenues
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* 1. Revenue Stream Tab Selector */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              Select Revenue Generation Stream
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Stream 1: Primary SaaS */}
              <button
                type="button"
                onClick={() => handleSelectStream('primary')}
                className={`p-3 rounded-2xl border text-left transition relative ${
                  stream === 'primary'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🏛️</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    PRIMARY (80%)
                  </span>
                </div>
                <p className="font-extrabold text-slate-900 text-xs">Govt App Management</p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  Municipal SaaS retainer fee for operating the AI civic platform
                </p>
              </button>

              {/* Stream 2: Secondary Worker Nominal Fee */}
              <button
                type="button"
                onClick={() => handleSelectStream('secondary')}
                className={`p-3 rounded-2xl border text-left transition relative ${
                  stream === 'secondary'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">⚡</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    SECONDARY (5%)
                  </span>
                </div>
                <p className="font-extrabold text-slate-900 text-xs">Worker Payout Fee</p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  Nominal fee (5%) on every repair payout between govt & worker
                </p>
              </button>

              {/* Stream 3: Tender Admin Commission */}
              <button
                type="button"
                onClick={() => handleSelectStream('contract_cut')}
                className={`p-3 rounded-2xl border text-left transition relative ${
                  stream === 'contract_cut'
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">📜</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    COMMISSION (15%)
                  </span>
                </div>
                <p className="font-extrabold text-slate-900 text-xs">Tender Admin Cut</p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  2.5% Admin percentage on contracts given to authorities
                </p>
              </button>
            </div>
          </div>

          {/* 2. Interactive Form Inputs */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Government Payer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Government Agency (Payer)
                </label>
                <select
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs outline-none focus:border-blue-500"
                >
                  <option value="Pune Municipal Corporation (PMC)">Pune Municipal Corporation (PMC)</option>
                  <option value="Pimpri-Chinchwad Municipal Corp (PCMC)">Pimpri-Chinchwad Municipal Corp (PCMC)</option>
                  <option value="Bruhat Bengaluru Mahanagara Palike (BBMP)">Bruhat Bengaluru Mahanagara Palike (BBMP)</option>
                  <option value="Smart City SPV Development Board">Smart City SPV Development Board</option>
                  <option value="State Public Works Department (PWD)">State Public Works Department (PWD)</option>
                </select>
              </div>

              {/* Beneficiary */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {stream === 'primary'
                    ? 'Platform Recipient'
                    : stream === 'secondary'
                    ? 'Target Field Worker'
                    : 'Awarded Contractor Authority'}
                </label>
                {stream === 'primary' ? (
                  <input
                    type="text"
                    disabled
                    value="CivicPulse AI Technologies Ltd."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs"
                  />
                ) : stream === 'secondary' ? (
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs outline-none focus:border-amber-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={authorityName}
                    onChange={(e) => setAuthorityName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs outline-none focus:border-purple-500"
                  />
                )}
              </div>
            </div>

            {/* Gross Amount & Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  {stream === 'primary'
                    ? 'Monthly SaaS Management Fee (INR)'
                    : stream === 'secondary'
                    ? 'Total Repair Payout Value (INR)'
                    : 'Total Public Tender Contract Value (INR)'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Current: ₹{grossAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1">
                  {stream === 'primary' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(150000)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹1.5L
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(250000)}
                        className="px-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold"
                      >
                        ₹2.5L
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(350000)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹3.5L
                      </button>
                    </>
                  )}

                  {stream === 'secondary' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(3000)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹3,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(4000)}
                        className="px-2 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-mono text-[10px] font-bold"
                      >
                        ₹4,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(7500)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹7,500
                      </button>
                    </>
                  )}

                  {stream === 'contract_cut' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(1500000)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹15L
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(2500000)}
                        className="px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 font-mono text-[10px] font-bold"
                      >
                        ₹25L
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrossAmount(5000000)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[10px] font-bold"
                      >
                        ₹50L
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Disbursement Gateway Channel
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs outline-none focus:border-blue-500"
                >
                  <option value="PFMS Treasury Direct Debit">PFMS Treasury Direct Debit (Govt Portal)</option>
                  <option value="CivicPulse Automated Worker Escrow Payout">CivicPulse Smart Escrow (NPCI UPI)</option>
                  <option value="Treasury Project Escrow Account">Treasury Capital Project Escrow (SBI RTGS)</option>
                  <option value="Municipal Smart City SPV Account">Municipal Smart City SPV Direct Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  CivicPulse Admin Cut / Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={stream === 'primary'}
                  value={customPercent}
                  onChange={(e) => setCustomPercent(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Live Financial Split & CivicPulse Revenue Projection Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                Live Revenue Split Calculation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {stream === 'primary' ? '100% Platform Direct' : `${customPercent}% Admin Facilitation Cut`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  {stream === 'primary' ? 'Govt Billed Total' : 'Gross Municipal Disbursal'}
                </span>
                <p className="text-sm font-bold text-slate-300 font-mono mt-0.5">
                  ₹{grossAmount.toLocaleString('en-IN')}
                </p>
                {recipientAllocation > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {stream === 'secondary' ? 'Technician Payout: ' : 'Contractor Payout: '}
                    <span className="text-white font-mono font-bold">₹{recipientAllocation.toLocaleString('en-IN')}</span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                  CivicPulse Net Revenue Earned
                </span>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  ₹{calculatedCivicCut.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-300/80 mt-1">
                  Credited to CivicPulse Platform Treasury
                </p>
              </div>
            </div>
          </div>

          {/* 4. Processing Animation Bar */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {processingStep === 1 && 'Connecting to Government PFMS Treasury Gateway...'}
                  {processingStep === 2 && 'Authenticating Municipal DSC Token & Checking Escrow...'}
                  {processingStep === 3 && 'Executing Smart Payout & Locking CivicPulse Admin Commission...'}
                  {processingStep === 4 && 'Generating Verified UTR Number & Digital Tax Invoice...'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${processingStep * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecutePayment}
            disabled={isProcessing || grossAmount <= 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer shadow-emerald-600/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Escrow...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  Authorize & Process ₹{calculatedCivicCut.toLocaleString('en-IN')} Revenue →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
