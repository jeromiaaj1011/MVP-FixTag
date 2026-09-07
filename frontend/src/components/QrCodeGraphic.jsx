import React from 'react';
import { QrCode, Tag } from 'lucide-react';

export default function QrCodeGraphic({ tag = "PRJ-205", size = "md" }) {
  const dimensionClass = size === "sm" ? "w-24 h-24" : size === "lg" ? "w-48 h-48" : "w-36 h-36";

  return (
    <div className="inline-block p-3 rounded-xl bg-[#0F172A] border border-[#334155] shadow-inner text-center group">
      {/* Industrial Tag Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#334155]/60 text-[10px] font-mono text-[#94A3B8]">
        <span className="flex items-center space-x-1">
          <Tag className="w-2.5 h-2.5 text-[#F97316]" />
          <span className="font-bold text-white tracking-wider">{tag}</span>
        </span>
        <span className="text-[9px] uppercase tracking-widest text-[#64748B]">FixTag</span>
      </div>

      {/* Stylized QR Matrix */}
      <div className={`${dimensionClass} mx-auto relative bg-[#1E293B] rounded-lg p-2 flex items-center justify-center border border-[#334155]`}>
        {/* Corner alignment markers */}
        <div className="absolute top-2 left-2 w-4 h-4 border-2 border-[#F97316] rounded-xs flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <div className="absolute top-2 right-2 w-4 h-4 border-2 border-[#F97316] rounded-xs flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-[#F97316] rounded-xs flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>

        {/* QR center icon and matrix effect */}
        <div className="w-12 h-12 rounded-lg bg-[#111827] border border-[#334155] flex items-center justify-center group-hover:scale-105 transition-transform">
          <QrCode className="w-8 h-8 text-[#F97316]" />
        </div>
      </div>

      <div className="mt-1.5 text-[9px] font-mono text-[#64748B] tracking-wider uppercase">
        Scan to report issue
      </div>
    </div>
  );
}
