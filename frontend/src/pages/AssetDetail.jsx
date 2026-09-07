import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  Share2,
  Printer
} from 'lucide-react';
import { MOCK_ASSETS, REPAIR_STAGES } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import QrCodeGraphic from '../components/QrCodeGraphic';

export default function AssetDetail() {
  const { assetTag } = useParams();
  const navigate = useNavigate();

  // Find asset matching the URL tag or default to PRJ-205
  const asset = MOCK_ASSETS.find(a => a.assetTag.toLowerCase() === (assetTag || '').toLowerCase()) || MOCK_ASSETS[0];

  // Determine current lifecycle index
  const currentStageIndex = REPAIR_STAGES.findIndex(s => s.id === asset.lifecycleStage);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/assets"
          className="inline-flex items-center space-x-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Assets</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors"
            title="Print Asset QR Tag"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Asset Hero Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Scannable Physical QR Visual */}
          <div className="shrink-0">
            <QrCodeGraphic tag={asset.assetTag} size="md" />
          </div>

          {/* Asset Metadata */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-lg bg-[#111827] text-[#F97316] border border-[#334155]">
                #{asset.assetTag}
              </span>
              <StatusBadge status={asset.status} />
              <span className="text-xs font-mono uppercase text-[#94A3B8] px-2 py-0.5 rounded bg-[#111827] border border-[#334155]/60">
                {asset.assetType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {asset.name}
            </h1>

            <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-[#94A3B8]">
              <MapPin className="w-4 h-4 text-[#F97316]" />
              <span>{asset.location}</span>
            </div>

            {/* Quick Action */}
            <div className="pt-2">
              <Link
                to={`/report?assetTag=${asset.assetTag}`}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20"
              >
                <Wrench className="w-4 h-4" />
                <span>Report Problem for #{asset.assetTag}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Fault Banner (if active) */}
      {asset.currentIssue && (
        <div className="p-6 rounded-2xl bg-[#1E293B] border-l-4 border-l-[#EF4444] border-y border-r border-[#334155] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#EF4444] font-bold">
                Current Active Fault
              </span>
            </div>
            <PriorityBadge priority={asset.currentIssue.priority} />
          </div>

          <h3 className="text-lg font-bold text-[#F9FAFB]">
            {asset.currentIssue.title}
          </h3>
          <p className="text-sm text-[#94A3B8]">
            {asset.currentIssue.description}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-[#64748B] font-mono border-t border-[#334155]/60">
            <span>Reported by: <span className="text-[#94A3B8]">{asset.currentIssue.reporter}</span></span>
            <span>{asset.currentIssue.reportedAt}</span>
          </div>
        </div>
      )}

      {/* Visual Repair Lifecycle */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F9FAFB] tracking-tight">
            Repair Lifecycle Progress
          </h2>
          <span className="text-xs font-mono text-[#F97316] uppercase font-bold">
            Active: {asset.lifecycleStage}
          </span>
        </div>

        {/* Lifecycle Stage Steps */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {REPAIR_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center space-y-2">
                {/* Visual Bar Connector */}
                <div 
                  className={`w-full h-2 rounded-full transition-all ${
                    isCompleted 
                      ? 'bg-[#22C55E]' 
                      : isCurrent 
                      ? 'bg-[#F97316] ring-2 ring-[#F97316]/40 shadow-[0_0_8px_#F97316]' 
                      : 'bg-[#334155]'
                  }`}
                />
                <div>
                  <span className={`text-[11px] font-bold font-mono block ${
                    isCurrent ? 'text-[#F97316]' : isCompleted ? 'text-[#22C55E]' : 'text-[#64748B]'
                  }`}>
                    {stage.label}
                  </span>
                  <span className="hidden sm:block text-[9px] text-[#64748B] mt-0.5 leading-tight">
                    {stage.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance History Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-[#F97316]" />
          <h2 className="text-xl font-bold text-[#F9FAFB] tracking-tight">
            Maintenance History
          </h2>
        </div>

        {/* Timeline Log */}
        <div className="relative pl-6 border-l-2 border-[#334155] space-y-6">
          {asset.maintenanceHistory.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#1E293B] border-2 border-[#F97316] group-hover:scale-125 transition-transform" />

              {/* Log Card */}
              <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider font-semibold">
                      {item.type}
                    </span>
                    <h4 className="text-sm font-bold text-[#F9FAFB]">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#64748B] shrink-0">
                    {item.date}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8]">
                  {item.notes}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#334155]/60 font-mono">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#94A3B8]" />
                    <span>{item.author}</span>
                  </span>
                  <StatusBadge status={item.status} size="small" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
