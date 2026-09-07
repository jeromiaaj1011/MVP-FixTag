import React from 'react';

export default function StatusBadge({ status, size = 'default' }) {
  const norm = (status || '').toLowerCase();

  let colors = {
    bg: 'bg-[#1E293B]',
    text: 'text-[#94A3B8]',
    border: 'border-[#334155]',
    dot: 'bg-[#94A3B8]',
  };

  if (norm.includes('repair') || norm.includes('reported')) {
    colors = {
      bg: 'bg-[#EF4444]/10',
      text: 'text-[#EF4444]',
      border: 'border-[#EF4444]/30',
      dot: 'bg-[#EF4444]',
    };
  } else if (norm.includes('progress') || norm.includes('assigned') || norm.includes('acknowledged')) {
    colors = {
      bg: 'bg-[#FBBF24]/10',
      text: 'text-[#FBBF24]',
      border: 'border-[#FBBF24]/30',
      dot: 'bg-[#FBBF24]',
    };
  } else if (norm.includes('fixed') || norm.includes('verified')) {
    colors = {
      bg: 'bg-[#22C55E]/10',
      text: 'text-[#22C55E]',
      border: 'border-[#22C55E]/30',
      dot: 'bg-[#22C55E]',
    };
  }

  const padding = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-lg border tracking-wide uppercase font-mono ${padding} ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
      <span>{status}</span>
    </span>
  );
}
