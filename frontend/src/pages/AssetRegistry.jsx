import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Search, 
  MapPin, 
  ArrowRight, 
  QrCode, 
  Plus, 
  AlertOctagon,
  RefreshCw,
  Database,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getAssets } from '../api/client';
import { MOCK_ASSETS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import QrCodeGraphic from '../components/QrCodeGraphic';

export default function AssetRegistry() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedQrAsset, setSelectedQrAsset] = useState(null);

  // Fetch real assets from FastAPI backend on mount
  useEffect(() => {
    fetchBackendAssets();
  }, []);

  const fetchBackendAssets = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to fetch assets from backend:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Unable to connect to FastAPI backend.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUseFallback = () => {
    setAssets(MOCK_ASSETS);
    setUsingFallback(true);
    setError(null);
  };

  // Derive unique asset types for category filter pills
  const assetTypes = [
    'ALL',
    ...new Set(
      assets
        .map((a) => a.asset_type || a.assetType)
        .filter(Boolean)
    ),
  ];

  // Filter assets based on search query and selected category
  const filteredAssets = assets.filter((asset) => {
    const tag = (asset.asset_tag || asset.assetTag || '').toLowerCase();
    const name = (asset.name || '').toLowerCase();
    const location = (asset.location || '').toLowerCase();
    const type = asset.asset_type || asset.assetType || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = name.includes(query) || tag.includes(query) || location.includes(query);
    const matchesType = selectedType === 'ALL' || type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#334155]/60 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316]">
              <Layers className="w-3.5 h-3.5" />
              <span>CAMPUS ASSET INVENTORY</span>
            </span>

            {/* Live API Status Pill */}
            {!loading && !error && !usingFallback && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] font-mono text-[#22C55E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span>FastAPI Live ({assets.length})</span>
              </span>
            )}

            {usingFallback && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[11px] font-mono text-[#FBBF24]">
                <Database className="w-3 h-3" />
                <span>Demo Fallback Mode</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
            Asset Registry
          </h1>
          <p className="mt-1.5 text-base text-[#94A3B8]">
            Directory of registered equipment, physical QR tags, and live operational states.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={fetchBackendAssets}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors disabled:opacity-50"
            title="Refresh assets from backend"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F97316]' : ''}`} />
          </button>
          <Link
            to="/report"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* Loading State View */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-[#1E293B] border border-[#334155] space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#F97316]/40 flex items-center justify-center mx-auto text-[#F97316]">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F9FAFB]">
              Fetching Assets from FastAPI...
            </h3>
            <p className="text-xs font-mono text-[#94A3B8]">
              GET {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/assets
            </p>
          </div>
        </div>
      )}

      {/* Error State View (Backend Offline or Network Failure) */}
      {!loading && error && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1E293B] border border-[#EF4444]/40 shadow-xl space-y-5">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#EF4444] font-bold">
                Backend Connection Error
              </span>
              <h3 className="text-lg font-bold text-[#F9FAFB]">
                Unable to load assets from FastAPI server
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Failed request to <code className="text-[#F9FAFB] font-mono px-1 py-0.5 rounded bg-[#111827]">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/assets</code>. 
                Ensure your Uvicorn backend is running on port 8000.
              </p>
              <div className="text-xs font-mono text-[#EF4444]/90 pt-1">
                Reason: {error}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#334155]/60">
            <button
              onClick={fetchBackendAssets}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center space-x-2 transition-all shadow-md shadow-[#F97316]/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
            <button
              onClick={handleUseFallback}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#334155] hover:bg-[#475569] text-white flex items-center space-x-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Load Demo Data (Offline Preview)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Search, Filter, and Grid (Rendered when not loading and no unhandled error) */}
      {!loading && !error && (
        <>
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by tag, name, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-sm text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
              />
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              {assetTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors border ${
                    selectedType === type
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white hover:border-[#94A3B8]/40'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map((asset) => {
              const tag = asset.asset_tag || asset.assetTag;
              const type = asset.asset_type || asset.assetType;
              const status = asset.status || 'Active';

              return (
                <div
                  key={asset.id}
                  className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="space-y-4">
                    {/* Card Top: Scannable Tag Badge + Status + Dynamic QR Visual */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#111827] text-[#F97316] border border-[#334155]">
                            #{tag}
                          </span>
                          <span className="text-[10px] text-[#64748B] uppercase font-mono truncate">
                            {type}
                          </span>
                        </div>

                        {/* Asset Name and Location */}
                        <div>
                          <h3 className="text-base font-bold text-[#F9FAFB] group-hover:text-[#F97316] transition-colors truncate">
                            {asset.name}
                          </h3>
                          <div className="mt-1 flex items-center space-x-1.5 text-xs text-[#94A3B8]">
                            <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                            <span className="truncate">{asset.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Scannable QR Tag Thumbnail */}
                      <div className="flex flex-col items-end space-y-2 shrink-0">
                        <StatusBadge status={status} size="small" />
                        <button
                          type="button"
                          onClick={() => setSelectedQrAsset(asset)}
                          className="p-1.5 bg-white rounded-xl shadow-sm border border-[#334155]/20 hover:scale-105 transition-transform group/qr"
                          title={`Click to view full inspection QR tag for #${tag}`}
                        >
                          <QRCodeCanvas
                            id={`qr-card-${tag}`}
                            value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/report/${tag}`}
                            size={56}
                            level="M"
                            bgColor="#FFFFFF"
                            fgColor="#0F172A"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Current Fault or Operational Status */}
                    {asset.currentIssue ? (
                      <div className="p-2.5 rounded-xl bg-[#111827]/80 border border-[#334155]/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono text-[#EF4444] font-semibold">
                            Current Issue
                          </span>
                          <PriorityBadge priority={asset.priority} />
                        </div>
                        <p className="text-[#F9FAFB] font-medium line-clamp-1">
                          {asset.currentIssue.title}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[#22C55E]/5 border border-[#22C55E]/20 text-xs flex items-center space-x-2 text-[#22C55E]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Operational & Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedQrAsset(asset)}
                      className="inline-flex items-center space-x-1.5 font-mono text-[#94A3B8] hover:text-[#F97316] transition-colors"
                      title="View physical inspection tag & QR"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>QR Tag</span>
                    </button>

                    <Link
                      to={`/assets/${tag}`}
                      className="inline-flex items-center space-x-1.5 font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors group/link"
                    >
                      <span>View Asset</span>
                      <ArrowRight className="w-3.5 h-3.5 group-link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search Result */}
          {filteredAssets.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#1E293B] border border-[#334155]">
              <p className="text-[#94A3B8]">
                {searchTerm
                  ? `No registered assets match "${searchTerm}".`
                  : 'No assets found in database.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Inspection Tag Preview & Download Modal */}
      {selectedQrAsset && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedQrAsset(null)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-3">
              <div className="flex items-center space-x-2 text-left">
                <QrCode className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs font-mono font-bold text-[#F9FAFB] uppercase tracking-wider">
                  Equipment Inspection Tag
                </span>
              </div>
              <button
                onClick={() => setSelectedQrAsset(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#334155] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <QrCodeGraphic
              tag={selectedQrAsset.asset_tag || selectedQrAsset.assetTag}
              name={selectedQrAsset.name}
              location={selectedQrAsset.location}
              size="lg"
              showActions={true}
              showMetadata={true}
            />

            <div className="pt-2 flex items-center justify-between text-xs text-[#64748B] font-mono border-t border-[#334155]/60">
              <span>FixTag Dynamic Tag</span>
              <Link
                to={`/report/${selectedQrAsset.asset_tag || selectedQrAsset.assetTag}`}
                className="text-[#F97316] hover:underline inline-flex items-center space-x-1"
              >
                <span>Test Link</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
