import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ArrowRight, 
  QrCode, 
  Plus, 
  MapPin, 
  Filter,
  Layers,
  Flame
} from 'lucide-react';
import { MOCK_ASSETS, MOCK_STATS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function Dashboard() {
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter issues needing attention (assets with an active issue)
  const activeIssues = MOCK_ASSETS.filter(a => a.currentIssue !== null);

  const displayedIssues = filterStatus === 'ALL'
    ? activeIssues
    : activeIssues.filter(a => {
        if (filterStatus === 'OPEN') return a.status === 'Needs Repair';
        if (filterStatus === 'PENDING') return a.status === 'In Progress';
        return true;
      });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero / Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#334155]/60 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316] mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>ASSET REPAIR COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
            What needs fixing?
          </h1>
          <p className="mt-1.5 text-base text-[#94A3B8]">
            Track issues and coordinate physical repairs across campus spaces.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Link
            to="/scan"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] transition-all hover:border-[#94A3B8]/40 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-[#F97316]" />
            <span>Scan QR</span>
          </Link>
          <Link
            to="/report"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Open Issues Card */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'OPEN' ? 'ALL' : 'OPEN')}
          className={`cursor-pointer p-5 rounded-2xl bg-[#1E293B] border transition-all duration-200 hover:translate-y-[-2px] ${
            filterStatus === 'OPEN' 
              ? 'border-[#EF4444] ring-1 ring-[#EF4444]' 
              : 'border-[#334155] hover:border-[#EF4444]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Open Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {MOCK_STATS.open}
            </span>
            <span className="text-xs text-[#EF4444] font-medium">Needs Triage</span>
          </div>
          <p className="mt-1 text-xs text-[#94A3B8]">Newly reported, awaiting assignment</p>
        </div>

        {/* Pending / In Progress Card */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`cursor-pointer p-5 rounded-2xl bg-[#1E293B] border transition-all duration-200 hover:translate-y-[-2px] ${
            filterStatus === 'PENDING' 
              ? 'border-[#FBBF24] ring-1 ring-[#FBBF24]' 
              : 'border-[#334155] hover:border-[#FBBF24]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Pending Repairs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {MOCK_STATS.pending}
            </span>
            <span className="text-xs text-[#FBBF24] font-medium">Active in field</span>
          </div>
          <p className="mt-1 text-xs text-[#94A3B8]">Technicians dispatched & working</p>
        </div>

        {/* Fixed / Resolved Card */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Resolved Past 30 Days
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {MOCK_STATS.fixed}
            </span>
            <span className="text-xs text-[#22C55E] font-medium">96% Resolved</span>
          </div>
          <p className="mt-1 text-xs text-[#94A3B8]">Verified functional & documented</p>
        </div>
      </div>

      {/* Needs Attention Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-[#F97316]" />
            <h2 className="text-xl font-bold tracking-tight text-[#F9FAFB]">
              Needs Attention ({displayedIssues.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 p-1 bg-[#1E293B] rounded-xl border border-[#334155] text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'ALL' ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('OPEN')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'OPEN' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Open ({MOCK_STATS.open})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'PENDING' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Pending ({MOCK_STATS.pending})
            </button>
          </div>
        </div>

        {/* Issue Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedIssues.map((asset) => (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-black/20"
            >
              <div className="space-y-3">
                {/* Header: Tag + Status + Priority */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#111827] text-[#F97316] border border-[#334155]">
                      #{asset.assetTag}
                    </span>
                    <span className="text-xs text-[#94A3B8] flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#94A3B8]" />
                      <span>{asset.location}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PriorityBadge priority={asset.priority} />
                    <StatusBadge status={asset.status} size="small" />
                  </div>
                </div>

                {/* Problem Summary */}
                <div>
                  <h3 className="text-base font-bold text-[#F9FAFB] group-hover:text-[#F97316] transition-colors line-clamp-1">
                    {asset.currentIssue?.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#94A3B8] line-clamp-2">
                    {asset.currentIssue?.description}
                  </p>
                </div>

                {/* Asset Details */}
                <div className="pt-2 border-t border-[#334155]/60 flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-medium text-[#F9FAFB]">{asset.name}</span>
                  <span className="font-mono text-[11px] text-[#64748B]">
                    Reported {asset.currentIssue?.reportedAt}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-3 border-t border-[#334155]/40 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">
                  Lifecycle: <span className="text-[#F9FAFB] font-medium">{asset.lifecycleStage}</span>
                </span>
                <Link
                  to={`/assets/${asset.assetTag}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors group/btn"
                >
                  <span>View Asset History</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
