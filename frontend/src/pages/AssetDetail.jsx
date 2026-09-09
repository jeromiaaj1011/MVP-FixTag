import React, { useState, useEffect } from 'react';
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
  Printer, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';
import { getAssetByTag } from '../api/client';
import { MOCK_ASSETS, REPAIR_STAGES } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import QrCodeGraphic from '../components/QrCodeGraphic';

export default function AssetDetail() {
  const { assetTag } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch real asset data from FastAPI backend on mount
  useEffect(() => {
    fetchAsset();
  }, [assetTag]);

  const fetchAsset = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAssetByTag(assetTag);
      setAsset(data);
    } catch (err) {
      console.warn(`Could not load asset '${assetTag}' from FastAPI, falling back to mock:`, err);
      // Fallback to mock assets matching tag or default to first mock asset
      const fallback = MOCK_ASSETS.find(
        (a) => a.assetTag.toLowerCase() === (assetTag || '').toLowerCase()
      ) || MOCK_ASSETS[0];
      setAsset(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !asset) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#F97316]/40 flex items-center justify-center mx-auto text-[#F97316]">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-mono text-[#94A3B8]">Loading asset details from FixTag...</p>
      </div>
    );
  }

  // Normalized values
  const tag = asset?.asset_tag || asset?.assetTag || assetTag || 'PRJ-204';
  const name = asset?.name || 'Equipment Asset';
  const location = asset?.location || 'Campus Facility';
  const type = asset?.asset_type || asset?.assetType || 'Equipment';
  const status = asset?.status || (asset?.issues && asset.issues.length > 0 ? asset.issues[0].status : 'Operational');

  // Destination report URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const reportUrl = `${baseUrl}/report/${tag}`;

  // Current lifecycle index if mock exists
  const currentStageIndex = REPAIR_STAGES.findIndex(s => s.id === asset?.lifecycleStage) !== -1 
    ? REPAIR_STAGES.findIndex(s => s.id === asset?.lifecycleStage) 
    : 0;

  // Active fault if present from real issues or mock
  const activeFault = (asset?.issues && asset.issues.find(i => i.status !== 'Fixed')) || asset?.currentIssue;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-canvas-${tag}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `FixTag-QR-${tag}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

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
          
          {/* Dynamic Physical QR Visual Thumbnail */}
          <div className="shrink-0">
            <QrCodeGraphic 
              tag={tag} 
              name={name}
              location={location}
              size="md" 
              showActions={false}
            />
          </div>

          {/* Asset Metadata */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-lg bg-[#111827] text-[#F97316] border border-[#334155]">
                #{tag}
              </span>
              <StatusBadge status={status} />
              <span className="text-xs font-mono uppercase text-[#94A3B8] px-2 py-0.5 rounded bg-[#111827] border border-[#334155]/60">
                {type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
              {name}
            </h1>

            <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-[#94A3B8]">
              <MapPin className="w-4 h-4 text-[#F97316]" />
              <span>{location}</span>
            </div>

            {/* Quick Action Link */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to={`/report/${tag}`}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20"
              >
                <Wrench className="w-4 h-4" />
                <span>Report Problem for #{tag}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Physical Tag & Scannable QR Code Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#334155]/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F9FAFB]">
                Physical QR Asset Tag
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Stick this scannable label on the physical hardware for instant incident reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* High-Resolution Dynamic Inspection Tag */}
          <div className="shrink-0">
            <QrCodeGraphic
              tag={tag}
              name={name}
              location={location}
              size="lg"
              showActions={true}
              showMetadata={true}
            />
          </div>

          {/* Technical Specs & Associated Data */}
          <div className="flex-1 space-y-4 w-full text-sm">
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#F9FAFB] text-base">
                Inspection Tag Properties
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                This QR barcode encodes the exact FixTag reporting endpoint. Scanning it with any mobile camera instantly routes the technician to the issue submission page with #{tag} automatically selected.
              </p>
            </div>

            {/* Target Destination URL Box */}
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#334155] space-y-1.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-semibold">
                Encoded Destination URL
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-[#F97316] truncate">
                  {reportUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-xs text-[#94A3B8] hover:text-white px-2.5 py-1 rounded-lg bg-[#1E293B] border border-[#334155] transition-colors shrink-0 flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#22C55E]" />
                      <span className="text-[#22C55E]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tag Association Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#111827]/70 border border-[#334155]/60 space-y-0.5">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Asset Name</span>
                <p className="font-semibold text-[#F9FAFB] truncate">{name}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#111827]/70 border border-[#334155]/60 space-y-0.5">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Physical Location</span>
                <p className="font-semibold text-[#F9FAFB] truncate">{location}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center space-x-2 transition-all shadow-md shadow-[#F97316]/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Tag (PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] flex items-center space-x-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag Label</span>
              </button>

              <Link
                to={`/report/${tag}`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors flex items-center space-x-1.5"
              >
                <span>Test Report Destination</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Fault Banner (if active) */}
      {activeFault && (
        <div className="p-6 rounded-2xl bg-[#1E293B] border-l-4 border-l-[#EF4444] border-y border-r border-[#334155] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#EF4444] font-bold">
                Current Active Fault
              </span>
            </div>
            <PriorityBadge priority={activeFault.priority} />
          </div>

          <h3 className="text-lg font-bold text-[#F9FAFB]">
            {activeFault.title}
          </h3>
          <p className="text-sm text-[#94A3B8]">
            {activeFault.description}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-[#64748B] font-mono border-t border-[#334155]/60">
            <span>Status: <span className="text-[#FBBF24] uppercase font-bold">{activeFault.status}</span></span>
            <span>{activeFault.reported_at ? new Date(activeFault.reported_at).toLocaleDateString() : activeFault.reportedAt}</span>
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
            Active: {asset?.lifecycleStage || (activeFault ? activeFault.status : 'Operational')}
          </span>
        </div>

        {/* Lifecycle Stage Steps */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {REPAIR_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

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
          {/* If real issues exist from database */}
          {asset?.issues && asset.issues.length > 0 ? (
            asset.issues.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#1E293B] border-2 border-[#F97316] group-hover:scale-125 transition-transform" />
                <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider font-semibold">
                        Ticket #TKT-{item.id}
                      </span>
                      <h4 className="text-sm font-bold text-[#F9FAFB]">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#64748B] shrink-0">
                      {item.reported_at ? new Date(item.reported_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8]">
                    {item.description}
                  </p>

                  {item.resolution_notes && (
                    <div className="p-2.5 rounded-lg bg-[#111827] text-xs text-[#22C55E] flex items-start space-x-2">
                      <span className="font-semibold text-[11px] font-mono shrink-0">Resolution:</span>
                      <span className="text-[#F9FAFB]">{item.resolution_notes}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#334155]/60 font-mono">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} size="small" />
                  </div>
                </div>
              </div>
            ))
          ) : asset?.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
            asset.maintenanceHistory.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#1E293B] border-2 border-[#F97316] group-hover:scale-125 transition-transform" />
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
            ))
          ) : (
            <div className="p-6 rounded-xl bg-[#1E293B] border border-[#334155] text-center text-xs text-[#94A3B8]">
              No past maintenance records found for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
