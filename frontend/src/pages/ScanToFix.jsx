import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scan, 
  QrCode, 
  ArrowRight, 
  AlertOctagon, 
  Tag, 
  Info, 
  Layers 
} from 'lucide-react';

export default function ScanToFix() {
  const [assetTagInput, setAssetTagInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleProcessTag = (tagToProcess) => {
    const rawTag = tagToProcess !== undefined ? tagToProcess : assetTagInput;
    // Normalize: trim leading/trailing whitespace and convert to uppercase
    const normalized = (rawTag || '').trim().toUpperCase();

    // Validate empty input
    if (!normalized) {
      setError('Please enter an asset tag to continue (e.g. PRJ-204).');
      return;
    }

    setError(null);
    // Navigate to the existing asset-aware report route
    navigate(`/report/${encodeURIComponent(normalized)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleProcessTag();
  };

  const sampleTags = [
    { tag: 'PRJ-204', label: 'Room 204 Projector' },
    { tag: 'PRJ-205', label: 'Room 205 Projector' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316]">
          <Scan className="w-3.5 h-3.5 animate-pulse" />
          <span>INSTANT FIELD TRIAGE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
          Scan to Fix
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
          Scan the QR tag attached to the physical asset, or enter the asset tag below.
        </p>
      </div>

      {/* Viewfinder & Manual Entry Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-2xl space-y-6">
        
        {/* Viewfinder Graphic (Visual QR Frame) */}
        <div className="relative mx-auto max-w-xs bg-[#0F172A] rounded-2xl border border-[#334155] p-6 text-center shadow-inner overflow-hidden">
          {/* Corner viewfinder brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#F97316] rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#F97316] rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#F97316] rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#F97316] rounded-br-sm" />

          {/* Animated Laser Scanning Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316] to-transparent shadow-[0_0_10px_#F97316] animate-scanline z-10" />

          <div className="w-16 h-16 mx-auto rounded-xl bg-[#111827] border border-[#334155] flex items-center justify-center text-[#F97316] shadow-inner mb-3">
            <QrCode className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-mono uppercase font-bold text-[#F9FAFB] tracking-wider">
              Physical QR Tag Scanner
            </p>
            <p className="text-[11px] text-[#64748B]">
              Camera integration ready • Manual entry active
            </p>
          </div>
        </div>

        {/* Manual Asset Tag Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="asset-tag-input"
                className="block text-xs font-mono uppercase text-[#94A3B8] font-semibold"
              >
                Asset Tag
              </label>
              <span className="text-[11px] font-mono text-[#64748B]">
                e.g. PRJ-204, PRJ-205
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316] font-mono text-sm font-bold">
                #
              </div>
              <input
                id="asset-tag-input"
                type="text"
                value={assetTagInput}
                onChange={(e) => {
                  setAssetTagInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="PRJ-204"
                autoFocus
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#111827] border border-[#334155] font-mono text-base text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all tracking-wider uppercase"
              />
            </div>

            {/* Validation Error Banner */}
            {error && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center space-x-2 animate-in fade-in">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Select Pills for Testing */}
          <div className="flex items-center space-x-2 text-xs pt-1">
            <span className="text-[#64748B] font-mono text-[11px]">Quick Test:</span>
            {sampleTags.map((sample) => (
              <button
                key={sample.tag}
                type="button"
                onClick={() => handleProcessTag(sample.tag)}
                className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#334155] border border-[#334155] text-xs font-mono text-[#F9FAFB] hover:text-[#F97316] transition-colors"
                title={`Simulate scan of ${sample.label}`}
              >
                #{sample.tag}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#F97316]/20 group"
          >
            <span>Continue to Report</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      {/* Explanatory Callout */}
      <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[#1E293B]/40 border border-[#334155]/60 text-xs text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#F9FAFB] block">
            How Field QR Triage Works
          </span>
          <p className="leading-relaxed">
            In physical deployments, scanning a physical equipment label opens <code className="text-[#F9FAFB] font-mono bg-[#111827] px-1 py-0.5 rounded">/report/&#123;assetTag&#125;</code> directly. This Scan page provides an equivalent entry point to triage or test any asset tag on campus.
          </p>
        </div>
      </div>
    </div>
  );
}
