import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  PlusCircle, 
  Wrench, 
  Tag, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  RotateCcw, 
  RefreshCw, 
  AlertOctagon, 
  Layers, 
  Clock, 
  QrCode, 
  ExternalLink 
} from 'lucide-react';
import { getAssets, getAssetByTag, createIssue } from '../api/client';
import { MOCK_ASSETS } from '../data/mockData';

export default function ReportIssue() {
  const { assetTag: routeAssetTag } = useParams();
  const [searchParams] = useSearchParams();
  const queryAssetTag = searchParams.get('assetTag');

  // Determine if this session was launched directly from a QR code scan
  const isQrMode = Boolean(routeAssetTag);
  const targetTag = routeAssetTag || queryAssetTag;

  // QR Mode: Dedicated Asset Fetch State
  const [qrAsset, setQrAsset] = useState(null);
  const [loadingQrAsset, setLoadingQrAsset] = useState(isQrMode);
  const [assetNotFound, setAssetNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Normal / Manual Mode: All Assets State
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(!isQrMode);
  const [loadAssetsError, setLoadAssetsError] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [currentStep, setCurrentStep] = useState(isQrMode ? 2 : 1);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdIssue, setCreatedIssue] = useState(null);

  // Load asset on mount or when route param changes
  useEffect(() => {
    if (routeAssetTag) {
      loadAssetByTag(routeAssetTag);
    } else {
      loadAllAssets(queryAssetTag);
    }
  }, [routeAssetTag, queryAssetTag]);

  // QR Mode: Fetch specific asset by asset_tag
  const loadAssetByTag = async (tag) => {
    setLoadingQrAsset(true);
    setAssetNotFound(false);
    setFetchError(null);

    try {
      const data = await getAssetByTag(tag);
      setQrAsset(data);
      setSelectedAssetId(data.id);
      // Skip manual selection step; start directly on problem description
      setCurrentStep(2);
    } catch (err) {
      console.warn(`Could not load asset '${tag}' from backend:`, err);
      if (err.response?.status === 404) {
        setAssetNotFound(true);
      } else {
        const errorMsg = err.response?.data?.detail || err.message || 'Unable to connect to FixTag backend.';
        setFetchError(errorMsg);
      }
    } finally {
      setLoadingQrAsset(false);
    }
  };

  // Normal Mode: Fetch all assets for dropdown selection
  const loadAllAssets = async (defaultTag = null) => {
    setLoadingAssets(true);
    setLoadAssetsError(null);

    try {
      const data = await getAssets();
      if (Array.isArray(data) && data.length > 0) {
        setAssets(data);
        const matched = defaultTag
          ? data.find((a) => (a.asset_tag || a.assetTag || '').toLowerCase() === defaultTag.toLowerCase())
          : null;
        setSelectedAssetId(matched ? matched.id : data[0].id);
      } else {
        setAssets(MOCK_ASSETS);
        setSelectedAssetId(MOCK_ASSETS[0].id);
      }
    } catch (err) {
      console.warn('Could not fetch asset catalog from backend, using fallback:', err);
      setLoadAssetsError('FastAPI backend offline. Displaying fallback asset list for demonstration.');
      setAssets(MOCK_ASSETS);
      setSelectedAssetId(MOCK_ASSETS[0].id);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Active Asset Identity
  const activeAsset = isQrMode
    ? qrAsset
    : assets.find((a) => String(a.id) === String(selectedAssetId)) || assets[0];

  const activeTag = activeAsset?.asset_tag || activeAsset?.assetTag || targetTag || 'PRJ-204';
  const activeName = activeAsset?.name || 'Equipment Asset';
  const activeLocation = activeAsset?.location || 'Campus Location';
  const activeType = activeAsset?.asset_type || activeAsset?.assetType || 'Equipment';

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const assetIdToSubmit = isQrMode ? qrAsset?.id : selectedAssetId;

    // Validation
    if (!assetIdToSubmit) {
      setSubmitError('A valid physical asset is required to report an issue.');
      if (!isQrMode) setCurrentStep(1);
      return;
    }
    if (!title.trim()) {
      setSubmitError('Problem title is required.');
      setCurrentStep(2);
      return;
    }
    if (!description.trim()) {
      setSubmitError('Problem description is required.');
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);

    try {
      // Must use integer database ID (asset_id), NOT the string asset_tag
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        asset_id: Number(assetIdToSubmit),
      };

      const result = await createIssue(payload);
      setCreatedIssue(result);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit issue to backend:', err);
      const detail = err.response?.data?.detail;
      let errorMsg = 'Failed to submit issue. Please verify backend connection.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d) => `${d.loc?.join('.')} ${d.msg}`).join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCreatedIssue(null);
    setTitle('');
    setDescription('');
    setPriority('High');
    setSubmitError(null);
    setCurrentStep(isQrMode ? 2 : 1);
  };

  // ==========================================
  // Loading State View (QR Mode)
  // ==========================================
  if (isQrMode && loadingQrAsset) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#F97316]/40 flex items-center justify-center mx-auto text-[#F97316]">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#F9FAFB]">
            Identifying Asset #{routeAssetTag}...
          </h3>
          <p className="text-xs font-mono text-[#94A3B8]">
            GET {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/assets/{routeAssetTag}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Invalid / 404 Nonexistent Asset State View
  // ==========================================
  if (isQrMode && assetNotFound) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center mx-auto text-[#EF4444]">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EF4444]">
            Asset Identification Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Asset #{routeAssetTag} Not Found
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-sm mx-auto">
            No registered physical equipment in the FixTag database matches the tag <code className="text-[#F9FAFB] font-mono px-1.5 py-0.5 rounded bg-[#111827]">#{routeAssetTag}</code>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155] text-left text-xs text-[#94A3B8] space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[#F9FAFB] font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
            <span>Possible Causes</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#64748B]">
            <li>The physical QR sticker tag has a typo or outdated tag ID.</li>
            <li>The equipment was decommissioned or not yet registered.</li>
            <li>The FastAPI server database was reset.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/report"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all shadow-md shadow-[#F97316]/20 flex items-center justify-center space-x-2"
          >
            <span>Select Asset Manually</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/assets"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors"
          >
            Browse Asset Registry
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // API Error State View
  // ==========================================
  if (isQrMode && fetchError) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center mx-auto text-[#EF4444]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EF4444]">
            Backend Connection Error
          </span>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">
            Unable to Retrieve Asset Data
          </h1>
          <p className="text-xs font-mono text-[#94A3B8]">{fetchError}</p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => loadAssetByTag(routeAssetTag)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center space-x-2 transition-all shadow-md shadow-[#F97316]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Success View (Issue Created in SQLite)
  // ==========================================
  if (isSubmitted && createdIssue) {
    return (
      <div className="max-w-xl mx-auto py-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center mx-auto text-[#22C55E] shadow-lg shadow-[#22C55E]/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22C55E]">
            Ticket Dispatched to Facilities
          </span>
          <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Issue Logged Successfully
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
            Your field ticket has been registered in the FixTag maintenance database.
          </p>
        </div>

        {/* Ticket Details Summary Card */}
        <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] text-left text-xs space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]/60">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#111827] text-[#F97316] border border-[#334155]">
              #TKT-{createdIssue.id}
            </span>
            <span className="inline-flex items-center space-x-1.5 font-mono text-[11px] text-[#FBBF24] px-2 py-0.5 rounded bg-[#FBBF24]/10 border border-[#FBBF24]/30">
              <span>Status: {createdIssue.status}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-mono block">Associated Asset</span>
              <span className="font-bold text-[#F9FAFB]">#{activeTag} — {activeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-mono block">Physical Location</span>
              <span className="text-[#94A3B8]">{activeLocation}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#334155]/60">
            <span className="text-[10px] text-[#64748B] uppercase font-mono block">Problem Title</span>
            <p className="text-[#F9FAFB] font-medium mt-0.5">{createdIssue.title}</p>
          </div>

          {createdIssue.reported_at && (
            <div className="text-[11px] font-mono text-[#64748B] flex items-center space-x-1 pt-1">
              <Clock className="w-3 h-3 text-[#64748B]" />
              <span>Timestamp: {new Date(createdIssue.reported_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Post-submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/issues"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md shadow-[#F97316]/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>View All Issues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Report Another Issue</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Main Form View
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F97316]">
          <Wrench className="w-3.5 h-3.5" />
          <span>FIELD ISSUE DISPATCH</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F9FAFB]">
          Report an Issue
        </h1>
        <p className="text-sm text-[#94A3B8]">
          {isQrMode
            ? `Reporting issue directly for physical equipment #${activeTag}.`
            : 'Log a physical equipment problem to create an active maintenance ticket.'}
        </p>
      </div>

      {/* Backend Offline Warning (normal mode) */}
      {!isQrMode && loadAssetsError && (
        <div className="p-3.5 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs text-[#FBBF24] flex items-center justify-between">
          <span>{loadAssetsError}</span>
          <button
            onClick={() => loadAllAssets()}
            className="underline hover:text-white ml-2 shrink-0 font-medium"
          >
            Retry Assets
          </button>
        </div>
      )}

      {/* QR IDENTIFIED ASSET DISPLAY CARD (Requirement 4) */}
      {isQrMode && qrAsset && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#1E293B] border border-[#F97316]/50 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#F97316]/15 border border-[#F97316]/40 text-xs font-mono font-bold text-[#F97316]">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>SCANNED QR TAG</span>
                </span>
                <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-[#111827] border border-[#334155]">
                  #{qrAsset.asset_tag}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#F9FAFB] tracking-tight">
                {qrAsset.name}
              </h2>
            </div>

            <Link
              to="/report"
              className="text-[11px] font-mono text-[#94A3B8] hover:text-[#F97316] underline shrink-0"
              title="Switch to manual asset selection"
            >
              Select Different Asset
            </Link>
          </div>

          {/* 4 Core Metadata Properties (Asset name, tag, location, type) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#334155]/60 space-y-0.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Asset Tag</span>
              <p className="font-mono font-bold text-[#F97316]">{qrAsset.asset_tag}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#334155]/60 space-y-0.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Asset Type</span>
              <p className="font-medium text-[#F9FAFB] truncate">{qrAsset.asset_type}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#334155]/60 space-y-0.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Location</span>
              <p className="font-medium text-[#F9FAFB] flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#F97316] shrink-0" />
                <span className="truncate">{qrAsset.location}</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#334155]/60 space-y-0.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Database ID</span>
              <p className="font-mono text-[#94A3B8]">asset_id: {qrAsset.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Progress Tracker */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { 
            step: 1, 
            label: isQrMode ? `1. Asset #${activeTag}` : '1. Select Asset', 
            locked: isQrMode 
          },
          { step: 2, label: '2. Describe Fault', locked: false },
          { step: 3, label: '3. Set Priority', locked: false },
        ].map((s) => {
          const isDone = currentStep > s.step || (isQrMode && s.step === 1);
          const isCurrent = currentStep === s.step;

          return (
            <div
              key={s.step}
              onClick={() => {
                if (isQrMode && s.step === 1) return;
                setCurrentStep(s.step);
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                s.locked ? 'cursor-default' : 'cursor-pointer'
              } ${
                isCurrent
                  ? 'bg-[#1E293B] border-[#F97316] text-[#F9FAFB] ring-1 ring-[#F97316]/40'
                  : isDone
                  ? 'bg-[#1E293B]/50 border-[#22C55E]/40 text-[#22C55E]'
                  : 'bg-[#111827] border-[#334155] text-[#64748B]'
              }`}
            >
              <span className="text-xs font-mono font-bold block flex items-center justify-center space-x-1">
                {isDone && <CheckCircle2 className="w-3 h-3 inline text-[#22C55E]" />}
                <span>{s.label}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-start space-x-3 animate-in fade-in">
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold font-mono uppercase block">Submission Error</span>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl space-y-6">
        
        {/* STEP 1: Select Asset (Only in normal /report mode) */}
        {!isQrMode && currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase text-[#94A3B8] font-semibold">
                  Select Physical Asset
                </label>
                {loadingAssets && (
                  <span className="text-[11px] font-mono text-[#F97316] flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Loading Assets...</span>
                  </span>
                )}
              </div>

              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                disabled={loadingAssets || assets.length === 0}
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#334155] text-[#F9FAFB] font-mono text-sm focus:outline-none focus:border-[#F97316] transition-colors disabled:opacity-50"
              >
                {assets.map((a) => {
                  const tag = a.asset_tag || a.assetTag;
                  return (
                    <option key={a.id} value={a.id}>
                      #{tag} — {a.name} ({a.location})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Preview Card */}
            {activeAsset && (
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#334155] flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#F97316] shrink-0 font-mono font-bold text-xs">
                  #{activeTag}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-bold text-white truncate">{activeName}</h4>
                  <p className="text-[#94A3B8] truncate">{activeLocation}</p>
                  <span className="text-[10px] text-[#64748B] uppercase font-mono">{activeType}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (selectedAssetId) setCurrentStep(2);
                else setSubmitError('Please select a valid physical asset.');
              }}
              disabled={loadingAssets || assets.length === 0}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-colors shadow-md shadow-[#F97316]/20 disabled:opacity-50"
            >
              <span>Continue to Problem Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Describe Fault */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 font-semibold">
                Problem Title
              </label>
              <input
                type="text"
                placeholder="e.g. Projector lamp not turning on, HDMI port intermittent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#334155] text-[#F9FAFB] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#F97316] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 font-semibold">
                Detailed Problem Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe specific symptoms, warning lights, unusual sounds, or safety hazards noticed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#334155] text-[#F9FAFB] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#F97316] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              {!isQrMode && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 rounded-xl font-semibold text-sm bg-[#111827] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors"
                  title="Back to Asset Selection"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (title.trim() && description.trim()) {
                    setSubmitError(null);
                    setCurrentStep(3);
                  } else {
                    setSubmitError('Please enter both problem title and description.');
                  }
                }}
                disabled={!title.trim() || !description.trim()}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-colors disabled:opacity-40"
              >
                <span>Continue to Priority</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Set Priority & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-3 font-semibold">
                Select Problem Severity / Priority
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Low', label: 'Low', desc: 'Cosmetic / Non-blocking', color: 'border-[#334155] hover:border-[#94A3B8]' },
                  { id: 'Medium', label: 'Medium', desc: 'Partial functionality', color: 'border-[#FBBF24]/50 hover:border-[#FBBF24]' },
                  { id: 'High', label: 'High', desc: 'Blocks class or lecture', color: 'border-[#F97316]/50 hover:border-[#F97316]' },
                  { id: 'Critical', label: 'Critical', desc: 'Safety hazard or outage', color: 'border-[#EF4444]/50 hover:border-[#EF4444]' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border text-center transition-all ${
                      priority === p.id
                        ? 'bg-[#F97316]/15 border-[#F97316] shadow-sm'
                        : `bg-[#111827] ${p.color}`
                    }`}
                  >
                    <span className="font-bold text-sm font-mono block text-white">{p.label}</span>
                    <span className="text-[10px] text-[#94A3B8] mt-1 block leading-tight">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Verification Summary Card */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#334155] text-xs space-y-2">
              <div className="flex justify-between text-[#64748B]">
                <span>Target Asset:</span>
                <span className="font-mono text-white">#{activeTag} ({activeName})</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Asset Location:</span>
                <span className="text-[#94A3B8]">{activeLocation}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Database asset_id:</span>
                <span className="font-mono text-[#F97316]">
                  {isQrMode ? qrAsset?.id : selectedAssetId}
                </span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Issue Title:</span>
                <span className="font-medium text-white truncate max-w-[240px]">{title}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Selected Priority:</span>
                <span className="font-bold text-[#F97316] uppercase">{priority}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={submitting}
                className="px-4 py-3 rounded-xl font-semibold text-sm bg-[#111827] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#F97316]/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Issue to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Maintenance Ticket</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
