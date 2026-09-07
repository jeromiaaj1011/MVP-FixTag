import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  const norm = (priority || '').toLowerCase();

  switch (norm) {
    case 'critical':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono uppercase bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 font-semibold">
          <AlertCircle className="w-3 h-3" />
          <span>Critical</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono uppercase bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/40 font-semibold">
          <AlertTriangle className="w-3 h-3" />
          <span>High Priority</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono uppercase bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/40 font-medium">
          <AlertTriangle className="w-3 h-3" />
          <span>Medium</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono uppercase bg-[#334155]/50 text-[#94A3B8] border border-[#334155] font-medium">
          <Info className="w-3 h-3" />
          <span>Low Priority</span>
        </span>
      );
  }
}
