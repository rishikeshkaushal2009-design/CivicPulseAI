"use client";

import React, { useState } from 'react';
import { BoundingBox } from '@/types/civic';
import { ShieldAlert, CheckCircle2, Crosshair, Eye, EyeOff, Cpu } from 'lucide-react';

interface YoloBoundingBoxOverlayProps {
  imageSrc: string;
  boundingBoxes?: BoundingBox[];
  isRejected?: boolean;
  rejectionReason?: string;
  confidenceScore?: number;
  yoloModelVersion?: string;
  isAnalyzing?: boolean;
  onRemovePhoto?: () => void;
}

export default function YoloBoundingBoxOverlay({
  imageSrc,
  boundingBoxes = [],
  isRejected = false,
  rejectionReason = '',
  confidenceScore = 97.4,
  yoloModelVersion = 'CivicPulse YOLOv8-Municipal-v3.2',
  isAnalyzing = false,
  onRemovePhoto,
}: YoloBoundingBoxOverlayProps) {
  const [showOverlays, setShowOverlays] = useState(true);

  if (!imageSrc) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl group select-none">
      {/* Target Image */}
      <img
        src={imageSrc}
        alt="Civic Issue Inspection"
        className="w-full h-72 sm:h-80 object-cover block"
      />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Real-time Laser Scanning Sweep Animation during AI Analysis */}
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[bounce_1.5s_infinite]" />
          <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              <span>YOLOv8 MULTIMODAL VISION RUNNING...</span>
            </div>
          </div>
        </div>
      )}

      {/* Bounding Box HUD Overlays */}
      {showOverlays && !isAnalyzing && boundingBoxes && boundingBoxes.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {boundingBoxes.map((box, idx) => {
            const isDefect = box.isDefect && !isRejected;
            const top = Math.max(0, Math.min(100, box.ymin * 100));
            const left = Math.max(0, Math.min(100, box.xmin * 100));
            const width = Math.max(10, Math.min(100 - left, (box.xmax - box.xmin) * 100));
            const height = Math.max(10, Math.min(100 - top, (box.ymax - box.ymin) * 100));

            return (
              <div
                key={idx}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
                className={`absolute transition-all duration-300 border-2 rounded-lg ${
                  isDefect
                    ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(52,211,153,0.35)] ring-1 ring-emerald-300/50'
                    : 'border-red-500 bg-red-600/20 shadow-[0_0_25px_rgba(239,68,68,0.45)] ring-2 ring-red-400/60'
                }`}
              >
                {/* Crosshairs at Bounding Box Corners */}
                <div
                  className={`absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 ${
                    isDefect ? 'border-emerald-300' : 'border-red-400'
                  }`}
                />
                <div
                  className={`absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 ${
                    isDefect ? 'border-emerald-300' : 'border-red-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 ${
                    isDefect ? 'border-emerald-300' : 'border-red-400'
                  }`}
                />
                <div
                  className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 ${
                    isDefect ? 'border-emerald-300' : 'border-red-400'
                  }`}
                />

                {/* Center Crosshair Target Marker */}
                <div className="absolute inset-0 flex items-center justify-center opacity-70">
                  <Crosshair
                    className={`w-5 h-5 ${isDefect ? 'text-emerald-300' : 'text-red-400'}`}
                  />
                </div>

                {/* Floating Tag Label */}
                <div
                  className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-tight shadow-lg whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md ${
                    isDefect
                      ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/60'
                      : 'bg-red-950/90 text-red-200 border border-red-500/80 animate-pulse'
                  }`}
                >
                  <span>{isDefect ? '🎯' : '⚠️'}</span>
                  <span>{box.label}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      isDefect ? 'bg-emerald-800 text-emerald-100' : 'bg-red-800 text-red-100'
                    }`}
                  >
                    {(box.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top HUD Status Bar */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Model Tag */}
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{yoloModelVersion}</span>
          </div>
        </div>

        {/* Controls: Toggle overlay & Remove button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            title={showOverlays ? 'Hide bounding boxes' : 'Show bounding boxes'}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition backdrop-blur-md"
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {onRemovePhoto && (
            <button
              type="button"
              onClick={onRemovePhoto}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/50 text-[11px] font-semibold transition backdrop-blur-md"
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>

      {/* Bottom HUD Banner: Rejected or Valid Defect Verified */}
      <div className="absolute bottom-2.5 inset-x-2.5 pointer-events-auto">
        {isRejected ? (
          <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 backdrop-blur-md shadow-xl flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold text-red-100 uppercase tracking-wider">
                  ⚠️ Complaint Rejected: Non-Civic Image
                </p>
                <p className="text-[10px] text-red-300 line-clamp-1">
                  {rejectionReason || 'No municipal infrastructure defect detected. Personal photos/selfies are rejected.'}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-red-800 text-white font-mono text-[9px] font-bold">
              LOCKED
            </span>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-slate-950/85 border border-emerald-500/40 text-emerald-200 backdrop-blur-md shadow-lg flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">
                Valid Civic Defect Detected
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ({confidenceScore}% confidence)
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              IOU: 0.52 | Latency: 16ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
