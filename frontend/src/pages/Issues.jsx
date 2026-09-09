import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertOctagon, 
  Search, 
  MapPin, 
  ArrowRight, 
  QrCode, 
  Plus, 
  RefreshCw, 
  Database, 
  Clock, 
  Calendar,
  CheckCircle2,
  Tag,
  Wrench,
  FileText
} from 'lucide-react';
import { getIssues } from '../api/client';
import { MOCK_ASSETS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Fetch real issues from FastAPI backend on mount
  useEffect(() => {
    fetchBackendIssues();
  }, []);

  const fetchBackendIssues = async (statusFilter = null) => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await getIssues(statusFilter);
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch issues from backend:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Unable to connect to FastAPI backend.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fallback handler: transforms mockData assets into an issues array if backend is down
  const handleUseFallback = () => {
    const fallbackIssues = [];
    MOCK_ASSETS.forEach((asset) => {
      if (asset.currentIssue) {
        fallbackIssues.push({
          id: asset.id + 10,
          asset_id: asset.id,
          title: asset.currentIssue.title,
          description: asset.currentIssue.description,
          priority: asset.currentIssue.priority,
          status: asset.status === 'Needs Repair' ? 'Reported' : asset.status,
          resolution_notes: null,
          reported_at: new Date().toISOString(),
          asset: {
            id: asset.id,
            asset_tag: asset.assetTag,
            name: asset.name,
            location: asset.location,
            asset_type: asset.assetType,
          },
        });
      }
    });
    setIssues(fallbackIssues);
    setUsingFallback(true);
    setError(null);
  };

  const statusOptions = ['ALL', 'Reported', 'Acknowledged', 'In Progress', 'Fixed'];

  // Filter issues based on search query and selected status pill
  const filteredIssues = issues.filter((issue) => {
    const title = (issue.title || '').toLowerCase();
    const desc = (issue.description || '').toLowerCase();
    const tag = (issue.asset?.asset_tag || '').toLowerCase();
    const assetName = (issue.asset?.name || '').toLowerCase();
    const location = (issue.asset?.location || '').toLowerCase();
    const issueIdStr = String(issue.id || '');
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      title.includes(query) ||
      desc.includes(query) ||
      tag.includes(query) ||
      assetName.includes(query) ||
      location.includes(query) ||
      issueIdStr.includes(query);

    const matchesStatus = 
      selectedStatus === 'ALL' || 
      (issue.status || '').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#334155]/60 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316]">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>FIELD MAINTENANCE TICKETS</span>
            </span>

            {/* Live API Status Pill */}
            {!loading && !error && !usingFallback && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] font-mono text-[#22C55E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span>FastAPI Live ({issues.length})</span>
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
            Reported Issues
          </h1>
          <p className="mt-1.5 text-base text-[#94A3B8]">
            Active and historical equipment breakdown tickets fetched from the FixTag database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => fetchBackendIssues()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors disabled:opacity-50"
            title="Refresh issues from backend"
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
              Fetching Issues from FastAPI...
            </h3>
            <p className="text-xs font-mono text-[#94A3B8]">
              GET {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/issues
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
                Unable to load issues from FastAPI server
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Failed request to <code className="text-[#F9FAFB] font-mono px-1 py-0.5 rounded bg-[#111827]">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/issues</code>.
                Make sure your FastAPI server is running on port 8000.
              </p>
              <div className="text-xs font-mono text-[#EF4444]/90 pt-1">
                Reason: {error}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#334155]/60">
            <button
              onClick={() => fetchBackendIssues()}
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
              <span>Load Demo Issues (Offline Preview)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Search, Status Filter, and Cards Grid */}
      {!loading && !error && (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search issues, assets, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-sm text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors border ${
                    selectedStatus === status
                      ? 'bg-[#F97316] text-white border-[#F97316]'
                      : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white hover:border-[#94A3B8]/40'
                  }`}
                >
                  {status === 'ALL' ? 'All Statuses' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Issues Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredIssues.map((issue) => {
              const assetTag = issue.asset?.asset_tag || `ID-${issue.asset_id}`;
              const assetName = issue.asset?.name || `Asset #${issue.asset_id}`;
              const location = issue.asset?.location || 'Campus Asset';

              return (
                <div
                  key={issue.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#94A3B8]/40 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="space-y-4">
                    {/* Card Header: Ticket Number, Asset Tag, Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#111827] text-[#F97316] border border-[#334155]">
                          #TKT-{issue.id}
                        </span>
                        <span className="font-mono text-xs text-[#94A3B8] px-2 py-0.5 rounded bg-[#111827] border border-[#334155]/60">
                          #{assetTag}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} size="small" />
                      </div>
                    </div>

                    {/* Problem Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-[#F9FAFB] group-hover:text-[#F97316] transition-colors line-clamp-1">
                        {issue.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#94A3B8] line-clamp-2">
                        {issue.description}
                      </p>
                    </div>

                    {/* Associated Asset Info */}
                    <div className="p-3 rounded-xl bg-[#111827]/80 border border-[#334155]/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span className="font-medium text-[#F9FAFB] truncate">{assetName}</span>
                        <span className="flex items-center space-x-1 shrink-0">
                          <MapPin className="w-3 h-3 text-[#F97316]" />
                          <span>{location}</span>
                        </span>
                      </div>

                      {/* Resolution Notes if available */}
                      {issue.resolution_notes && (
                        <div className="mt-2 pt-2 border-t border-[#334155]/60 text-[#FBBF24] text-[11px] flex items-start space-x-1.5">
                          <Wrench className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Note: {issue.resolution_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Timestamps and Action */}
                  <div className="mt-5 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#64748B]" />
                      <span>
                        {issue.reported_at
                          ? new Date(issue.reported_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </span>

                    <Link
                      to={`/assets/${issue.asset?.asset_tag || issue.asset_id}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors group/link"
                    >
                      <span>View Asset History</span>
                      <ArrowRight className="w-3.5 h-3.5 group-link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State View */}
          {filteredIssues.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#1E293B] border border-[#334155] space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto opacity-70" />
              <h3 className="text-base font-bold text-[#F9FAFB]">
                {searchTerm
                  ? `No issues match "${searchTerm}".`
                  : selectedStatus !== 'ALL'
                  ? `No issues found with status "${selectedStatus}".`
                  : 'No maintenance issues recorded.'}
              </h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                All physical campus assets are currently running without active breakdown tickets.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
