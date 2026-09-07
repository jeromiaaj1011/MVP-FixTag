import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Search, 
  MapPin, 
  ArrowRight, 
  QrCode, 
  Plus, 
  Tag, 
  Filter
} from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AssetRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Extract unique types for filter pills
  const assetTypes = ['ALL', ...new Set(MOCK_ASSETS.map(a => a.assetType))];

  const filteredAssets = MOCK_ASSETS.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || asset.assetType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#334155]/60 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316] mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>CAMPUS ASSET INVENTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
            Asset Registry
          </h1>
          <p className="mt-1.5 text-base text-[#94A3B8]">
            Directory of registered equipment, QR tags, and current operational states.
          </p>
        </div>

        {/* Link to Report */}
        <Link
          to="/report"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </Link>
      </div>

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

      {/* Asset Cards Grid (Not a boring table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-black/20"
          >
            <div className="space-y-4">
              
              {/* Card Top: Scannable Tag Badge + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#334155] flex items-center justify-center text-[#F97316] group-hover:border-[#F97316] transition-colors">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-[#F9FAFB] tracking-wider">
                      #{asset.assetTag}
                    </span>
                    <span className="block text-[10px] text-[#64748B] uppercase font-mono">
                      {asset.assetType}
                    </span>
                  </div>
                </div>

                <StatusBadge status={asset.status} size="small" />
              </div>

              {/* Asset Name and Location */}
              <div>
                <h3 className="text-base font-bold text-[#F9FAFB] group-hover:text-[#F97316] transition-colors">
                  {asset.name}
                </h3>
                <div className="mt-1 flex items-center space-x-1.5 text-xs text-[#94A3B8]">
                  <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{asset.location}</span>
                </div>
              </div>

              {/* Current Active Issue Banner if any */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>No active faults recorded</span>
                </div>
              )}
            </div>

            {/* Card Footer: View Action */}
            <div className="mt-5 pt-3 border-t border-[#334155]/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#64748B]">
                {asset.maintenanceHistory.length} Maintenance Events
              </span>
              <Link
                to={`/assets/${asset.assetTag}`}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors group/link"
              >
                <span>View Asset</span>
                <ArrowRight className="w-3.5 h-3.5 group-link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#1E293B] border border-[#334155]">
          <p className="text-[#94A3B8]">No physical assets match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
