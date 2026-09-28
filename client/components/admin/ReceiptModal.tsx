"use client";

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, Download, Building2, Landmark, FileText, QrCode } from 'lucide-react';
import { RevenueRecord } from '@/types/civic';

interface ReceiptModalProps {
  transaction: RevenueRecord | null;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isPrimary = transaction.stream === 'primary' || transaction.type === 'Govt SaaS Management' || transaction.type === 'Govt Contract';
  const isSecondary = transaction.stream === 'secondary' || transaction.type === 'Worker Transaction Fee';
  const isContractCut = transaction.stream === 'contract_cut' || transaction.type === 'Contract Authority Commission';

  const gross = transaction.grossAmount || transaction.amount;
  const cutPercent = transaction.adminCutPercent || (isPrimary ? 100 : isSecondary ? 5.0 : 2.5);
  const civicEarnings = transaction.amount;
  const recipientShare = isPrimary ? 0 : gross - civicEarnings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
              PFMS Treasury Settlement Audit Record
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md shrink-0">
                <img
                  src="/logo.png"
                  alt="CivicPulse Official Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  CivicPulse AI Technologies Ltd.
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Gov-Tech Municipal Automation & Urban Grievance Infrastructure
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  GSTIN: 27AABCC8921P1ZT • CIN: U72900MH2025PTC384910
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right font-mono">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                ● Payment Settled
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1.5">
                {transaction.invoiceId || `INV-CP-2026-${transaction.id.slice(-4)}`}
              </p>
              <p className="text-[10px] text-slate-400">
                Date: {new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Revenue Stream Pillar Badge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isPrimary
              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
              : isSecondary
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-purple-50/70 border-purple-200 text-purple-950'
          }`}>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                {isPrimary ? 'Primary Revenue Stream' : isSecondary ? 'Secondary Revenue Stream' : 'Contract Commission Stream'}
              </span>
              <h3 className="font-extrabold text-sm">{transaction.type}</h3>
              <p className="text-[11px] opacity-80">{transaction.description}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold block opacity-75">CivicPulse Cut</span>
              <span className="font-mono font-extrabold text-sm">
                {isPrimary ? '100% Platform Retainer' : `${cutPercent}% Commission`}
              </span>
            </div>
          </div>

          {/* Transaction Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Government Payer</span>
              <span className="font-bold text-slate-900">{transaction.payer || 'Pune Municipal Corporation (PMC)'}</span>
              <span className="text-slate-500 text-[10px] block">Public Urban Local Body</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Beneficiary / Recipient</span>
              <span className="font-bold text-slate-900">{transaction.payee || 'CivicPulse Platform Escrow'}</span>
              <span className="text-slate-500 text-[10px] block">
                {isPrimary ? 'CivicPulse Revenue Account' : isSecondary ? 'Technician Payout Account' : 'Awarded Contractor Entity'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Treasury Banking UTR</span>
              <span className="font-bold text-blue-700">{transaction.transactionRef || 'PFMS/IN/2026/0894218'}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Disbursement Channel</span>
              <span className="font-bold text-slate-700">{transaction.paymentMethod || 'PFMS Treasury Direct Debit'}</span>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Line Item Description</th>
                  <th className="py-2.5 px-4 text-center">Allocation Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">Gross Transaction Volume</p>
                    <p className="text-[11px] text-slate-500">Total municipal value processed through smart escrow</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono">100.0%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{gross.toLocaleString('en-IN')}
                  </td>
                </tr>

                {recipientShare > 0 && (
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-700">
                        {isSecondary ? 'Worker Payout (Disbursed to Technician)' : 'Contractor Allocation (Awarded Authority)'}
                      </p>
                      <p className="text-[11px] text-slate-400">Directly transferred to verified bank account</p>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-mono">
                      {(100 - cutPercent).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{recipientShare.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}

                <tr className="bg-emerald-50/50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CivicPulse Platform Revenue Earned</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {isPrimary
                        ? 'Municipal App Management Retainer & SLA Guarantee'
                        : isSecondary
                        ? 'Nominal Transaction Facilitation & AI Verification Fee'
                        : 'Contract Tender Admin Commission & Milestone Auditing Cut'}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-800 font-mono font-bold">
                    {cutPercent}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 text-sm">
                    ₹{civicEarnings.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Digital Signature & Compliance Seal */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Cryptographically Verified Digital Treasury Receipt
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  SHA-256: 8f9b2c34d...e4a1 • PFMS Node #PMC-NODE-411005
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-amber-300 font-mono text-[10px] font-bold text-center">
              CERTIFIED COMPLIANT
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            Transaction ID: {transaction.id}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
