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
  FileText,
  ChevronDown,
  Edit3,
  X
} from 'lucide-react';
import { getIssues, updateIssueStatus } from '../api/client';
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

  // Step 3B.4 Status Update & Resolution Notes State
  const [updatingId, setUpdatingId] = useState(null);
  const [cardErrors, setCardErrors] = useState({});
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    issue: null,
    notes: '',
    error: null,
    isSubmitting: false,
  });

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

  // Perform status update to FastAPI PATCH /api/issues/{id}/status
  const performStatusUpdate = async (issueId, newStatus, resolutionNotes = null) => {
    setUpdatingId(issueId);
    setCardErrors((prev) => {
      const copy = { ...prev };
      delete copy[issueId];
      return copy;
    });

    try {
      const updatedIssue = await updateIssueStatus(issueId, newStatus, resolutionNotes);
      // Synchronize frontend state with the updated record returned by FastAPI
      setIssues((prev) =>
        prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item))
      );
    } catch (err) {
      console.error(`Failed to update status for issue #${issueId}:`, err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to update issue status on the server.';
      setCardErrors((prev) => ({ ...prev, [issueId]: msg }));
    } finally {
      setUpdatingId(null);
    }
  };

  // Handler when user selects a status from the card dropdown
  const handleStatusChange = (issue, targetStatus) => {
    if (targetStatus === issue.status) return;

    if (targetStatus === 'Fixed') {
      // Opening resolution notes modal before submitting "Fixed"
      setResolveModal({
        isOpen: true,
        issue: issue,
        notes: issue.resolution_notes || '',
        error: null,
        isSubmitting: false,
      });
    } else {
      // Direct update for Reported, Acknowledged, In Progress
      performStatusUpdate(issue.id, targetStatus, issue.resolution_notes);
    }
  };

  // Handler to open modal for editing notes on an already Fixed issue
  const openEditNotesModal = (issue) => {
    setResolveModal({
      isOpen: true,
      issue: issue,
      notes: issue.resolution_notes || '',
      error: null,
      isSubmitting: false,
    });
  };

  // Handler to confirm resolution in modal
  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    if (!resolveModal.issue) return;

    setResolveModal((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const notesToSubmit = resolveModal.notes.trim() || null;
      const updatedIssue = await updateIssueStatus(
        resolveModal.issue.id,
        'Fixed',
        notesToSubmit
      );

      // Update state with updated record from FastAPI
      setIssues((prev) =>
        prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item))
      );

      // Close modal
      setResolveModal({
        isOpen: false,
        issue: null,
        notes: '',
        error: null,
        isSubmitting: false,
      });
    } catch (err) {
      console.error('Failed to resolve issue:', err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to resolve issue on the server.';
      setResolveModal((prev) => ({ ...prev, isSubmitting: false, error: msg }));
    }
  };

  const handleCloseModal = () => {
    if (resolveModal.isSubmitting) return;
    setResolveModal({
      isOpen: false,
      issue: null,
      notes: '',
      error: null,
      isSubmitting: false,
    });
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
                        <div className="mt-2 pt-2 border-t border-[#334155]/60 text-[#22C55E] text-[11px] flex items-start space-x-1.5">
                          <Wrench className="w-3 h-3 shrink-0 mt-0.5 text-[#22C55E]" />
                          <span className="leading-tight">Note: {issue.resolution_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* Interactive Status Selector & Actions */}
                    <div className="pt-3 border-t border-[#334155]/60 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`status-select-${issue.id}`} className="text-[11px] font-mono text-[#94A3B8] uppercase">
                          Status:
                        </label>
                        <div className="relative inline-block">
                          <select
                            id={`status-select-${issue.id}`}
                            value={issue.status}
                            disabled={updatingId === issue.id}
                            onChange={(e) => handleStatusChange(issue, e.target.value)}
                            className="appearance-none bg-[#111827] text-xs font-mono font-medium text-[#F9FAFB] border border-[#334155] hover:border-[#F97316]/60 rounded-lg pl-2.5 pr-7 py-1 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Reported">Reported</option>
                            <option value="Acknowledged">Acknowledged</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Fixed">Fixed</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {updatingId === issue.id && (
                          <span className="flex items-center space-x-1.5 text-xs text-[#F97316] font-mono">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span className="text-[11px]">Updating...</span>
                          </span>
                        )}
                      </div>

                      {issue.status === 'Fixed' && (
                        <button
                          type="button"
                          onClick={() => openEditNotesModal(issue)}
                          className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#22C55E] hover:text-[#4ADE80] transition-colors"
                          title="Edit resolution notes"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{issue.resolution_notes ? 'Edit Notes' : 'Add Notes'}</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Error Message for this card if update failed */}
                    {cardErrors[issue.id] && (
                      <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{cardErrors[issue.id]}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCardErrors((prev) => {
                              const copy = { ...prev };
                              delete copy[issue.id];
                              return copy;
                            })
                          }
                          className="text-[#EF4444] hover:text-white ml-2 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Card Footer: Timestamps and Action */}
                    <div className="pt-2 border-t border-[#334155]/40 flex items-center justify-between text-xs">
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

      {/* Resolution Notes Modal (When marking as Fixed or editing resolution) */}
      {resolveModal.isOpen && resolveModal.issue && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#334155]/60 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F9FAFB]">
                    Mark Issue as Fixed
                  </h3>
                  <span className="text-xs font-mono text-[#94A3B8]">
                    Ticket #TKT-{resolveModal.issue.id} • {resolveModal.issue.asset?.asset_tag || `Asset #${resolveModal.issue.asset_id}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={resolveModal.isSubmitting}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Details Summary */}
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#334155]/60 space-y-1">
              <div className="text-xs font-semibold text-[#F9FAFB]">
                {resolveModal.issue.title}
              </div>
              <p className="text-xs text-[#94A3B8] line-clamp-2">
                {resolveModal.issue.description}
              </p>
              <div className="text-[11px] font-mono text-[#64748B] pt-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#F97316]" />
                <span>
                  {resolveModal.issue.asset?.name || `Asset #${resolveModal.issue.asset_id}`} • {resolveModal.issue.asset?.location || 'Campus Asset'}
                </span>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label
                  htmlFor="resolution-notes-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5"
                >
                  Resolution Notes
                </label>
                <textarea
                  id="resolution-notes-input"
                  rows={4}
                  value={resolveModal.notes}
                  onChange={(e) =>
                    setResolveModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Describe what repairs were performed (e.g. replaced lamp, reconnected loose cable, verified video signal)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#334155] text-sm text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all resize-none"
                  disabled={resolveModal.isSubmitting}
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  These notes will be saved to the database and displayed on this issue ticket and asset history.
                </p>
              </div>

              {/* Modal Error Alert */}
              {resolveModal.error && (
                <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs flex items-start space-x-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{resolveModal.error}</div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#334155]/60">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={resolveModal.isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#111827] hover:bg-[#334155] border border-[#334155] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveModal.isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-white flex items-center space-x-2 transition-all shadow-md shadow-[#22C55E]/20 disabled:opacity-50"
                >
                  {resolveModal.isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Mark Fixed</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
