import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  Scan, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  Layers,
  Wrench
} from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockData';

export default function ScanToFix() {
  const [scanning, setScanning] = useState(false);
  const [detectedAsset, setDetectedAsset] = useState(null);
  const navigate = useNavigate();

  const handleSimulateScan = (assetTag = "PRJ-205") => {
    setScanning(true);
    setDetectedAsset(null);

    // Simulate real-world recognition delay
    setTimeout(() => {
      setScanning(false);
      const matched = MOCK_ASSETS.find(a => a.assetTag === assetTag) || MOCK_ASSETS[0];
      setDetectedAsset(matched);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316]">
          <Scan className="w-3.5 h-3.5 animate-pulse" />
          <span>INSTANT FIELD TRIAGE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
          Scan to Fix
        </h1>
        <p className="text-base text-[#94A3B8] max-w-md mx-auto">
          Scan any physical FixTag QR sticker to immediately open issue reporting and maintenance history.
        </p>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="relative mx-auto max-w-md bg-[#0F172A] rounded-3xl border-2 border-[#334155] p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative corner brackets (Industrial Viewfinder) */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-[#F97316] rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-[#F97316] rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-[#F97316] rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-[#F97316] rounded-br-lg" />

        {/* Viewfinder Target Area */}
        <div className="relative aspect-square w-full rounded-2xl bg-[#1E293B]/60 border border-[#334155] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          
          {/* Animated Laser Scanning Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316] to-transparent shadow-[0_0_12px_#F97316] animate-scanline z-10" />

          {/* Central Target Grid Icon */}
          <div className="relative z-0 p-6 rounded-2xl bg-[#111827]/80 border border-[#334155] shadow-inner mb-4">
            <QrCode className="w-16 h-16 text-[#F97316]/80" />
          </div>

          <p className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">
            {scanning ? "Aligning QR Matrix..." : "Position QR Code within Frame"}
          </p>

          {/* Prototype Notice */}
          <span className="mt-2 text-[10px] text-[#64748B] px-2 py-0.5 rounded bg-[#111827] border border-[#334155]/60">
            UI Prototype Mode (Hardware Camera in Step 3B)
          </span>
        </div>

        {/* Scanner Action Controls */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleSimulateScan("PRJ-205")}
            disabled={scanning}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{scanning ? "Reading QR Data..." : "Simulate QR Scan (Projector #PRJ-205)"}</span>
          </button>

          {/* Alternate simulation buttons for testing */}
          <div className="flex items-center justify-center space-x-2 text-xs text-[#94A3B8]">
            <span>Or test:</span>
            <button
              onClick={() => handleSimulateScan("C-104")}
              className="text-[#F9FAFB] hover:text-[#F97316] underline underline-offset-4"
            >
              Chair #C-104
            </button>
            <span>•</span>
            <button
              onClick={() => handleSimulateScan("WD-21")}
              className="text-[#F9FAFB] hover:text-[#F97316] underline underline-offset-4"
            >
              Water Dispenser #WD-21
            </button>
          </div>
        </div>
      </div>

      {/* Detection Result Card (Triggered by Simulation) */}
      {detectedAsset && (
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#22C55E]/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-[#22C55E] font-semibold tracking-wider">
                  Asset Successfully Detected
                </span>
                <h3 className="text-lg font-bold text-white">
                  {detectedAsset.name}
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#111827] text-[#F97316] border border-[#334155]">
              #{detectedAsset.assetTag}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-[#111827] p-3 rounded-xl border border-[#334155]/60 text-[#94A3B8]">
            <div>
              <span className="text-[#64748B] block">Location</span>
              <span className="font-medium text-white">{detectedAsset.location}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Current Status</span>
              <span className="font-medium text-white">{detectedAsset.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/report?assetTag=${detectedAsset.assetTag}`)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#F97316]/20"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Report Problem for #{detectedAsset.assetTag}</span>
            </button>
            <button
              onClick={() => navigate(`/assets/${detectedAsset.assetTag}`)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#334155] hover:bg-[#475569] text-white flex items-center space-x-1.5 transition-colors"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[#1E293B]/40 border border-[#334155]/60 text-xs text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
        <p>
          In a physical deployment, each QR code encodes a direct deep-link (e.g.{' '}
          <code className="text-[#F9FAFB] font-mono">/report/PRJ-205</code>). Anyone scanning with their native smartphone camera is instantly routed to this triage workflow.
        </p>
      </div>
    </div>
  );
}
