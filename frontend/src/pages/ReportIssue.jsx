import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Clock
} from 'lucide-react';
import { getAssets, createIssue } from '../api/client';
import { MOCK_ASSETS } from '../data/mockData';

export default function ReportIssue() {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('assetTag') || 'PRJ-205';

  // Backend Assets State
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadAssetsError, setLoadAssetsError] = useState(null);

  // Form Fields State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [currentStep, setCurrentStep] = useState(1);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdIssue, setCreatedIssue] = useState(null);

  // Fetch real assets from FastAPI backend on mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    setLoadAssetsError(null);

    try {
      const data = await getAssets();
      if (Array.isArray(data) && data.length > 0) {
        setAssets(data);
        // Match initial tag from query param or default to first asset
        const matched = data.find(
          (a) => (a.asset_tag || a.assetTag || '').toLowerCase() === initialTag.toLowerCase()
        );
        setSelectedAssetId(matched ? matched.id : data[0].id);
      } else {
        // Empty asset list fallback
        setAssets(MOCK_ASSETS);
        setSelectedAssetId(MOCK_ASSETS[0].id);
      }
    } catch (err) {
      console.warn('Could not fetch assets from backend, using fallback:', err);
      setLoadAssetsError('FastAPI backend offline. Displaying fallback asset list for demonstration.');
      setAssets(MOCK_ASSETS);
      const matched = MOCK_ASSETS.find(
        (a) => (a.assetTag || '').toLowerCase() === initialTag.toLowerCase()
      );
      setSelectedAssetId(matched ? matched.id : MOCK_ASSETS[0].id);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Currently selected asset object for preview card
  const selectedAsset = assets.find((a) => String(a.id) === String(selectedAssetId)) || assets[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Form validation
    if (!selectedAssetId) {
      setSubmitError('Please select a valid physical asset.');
      setCurrentStep(1);
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
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        asset_id: Number(selectedAssetId),
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
    setCurrentStep(1);
  };

  // ==========================================
  // Success View (Issue Created in SQLite)
  // ==========================================
  if (isSubmitted && createdIssue) {
    const assetTag = selectedAsset?.asset_tag || selectedAsset?.assetTag || `ID-${createdIssue.asset_id}`;
    const assetName = selectedAsset?.name || 'Registered Asset';
    const location = selectedAsset?.location || 'Campus Location';

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto shadow-lg shadow-[#22C55E]/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono font-bold uppercase tracking-wider">
            ✓ Persisted to SQLite
          </div>
          <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Issue Reported Successfully
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Your maintenance ticket has been registered in the database and queued for technician dispatch.
          </p>
        </div>

        {/* Ticket Summary Card */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] text-left space-y-3.5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <span className="text-xs font-mono text-[#64748B] uppercase font-bold">Database Ticket ID</span>
            <span className="font-mono text-sm font-extrabold text-[#F97316]">#TKT-{createdIssue.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block">Asset</span>
              <span className="font-bold text-[#F9FAFB]">#{assetTag} ({assetName})</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Location</span>
              <span className="text-[#F9FAFB] font-medium">{location}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Initial Status</span>
              <span className="text-[#EF4444] font-mono font-bold uppercase">{createdIssue.status}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Priority</span>
              <span className="text-[#F97316] font-bold uppercase">{createdIssue.priority}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#334155]/60 text-xs">
            <span className="text-[#64748B] block">Problem Title:</span>
            <p className="text-[#F9FAFB] font-medium mt-0.5">{createdIssue.title}</p>
          </div>

          {createdIssue.reported_at && (
            <div className="text-[11px] font-mono text-[#64748B] flex items-center space-x-1 pt-1">
              <Clock className="w-3 h-3 text-[#64748B]" />
              <span>Timestamp: {new Date(createdIssue.reported_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Post-submit Navigation Actions */}
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
  // Main Form View (3-Step Guided Flow)
  // ==========================================
  const assetTag = selectedAsset?.asset_tag || selectedAsset?.assetTag || 'PRJ-205';
  const assetName = selectedAsset?.name || 'Loading equipment...';
  const location = selectedAsset?.location || 'Campus Location';
  const assetType = selectedAsset?.asset_type || selectedAsset?.assetType || 'Equipment';

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
          Log a physical equipment problem to create an active maintenance ticket.
        </p>
      </div>

      {/* Backend Offline Banner Warning (if assets failed to load) */}
      {loadAssetsError && (
        <div className="p-3.5 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs text-[#FBBF24] flex items-center justify-between">
          <span>{loadAssetsError}</span>
          <button
            onClick={fetchAssets}
            className="underline hover:text-white ml-2 shrink-0 font-medium"
          >
            Retry Assets
          </button>
        </div>
      )}

      {/* Structured Multi-Step Progress Tracker */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { step: 1, label: '1. Select Asset' },
          { step: 2, label: '2. Describe Fault' },
          { step: 3, label: '3. Set Priority' },
        ].map((s) => (
          <div
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
              currentStep === s.step
                ? 'bg-[#1E293B] border-[#F97316] text-[#F9FAFB] ring-1 ring-[#F97316]/40'
                : currentStep > s.step
                ? 'bg-[#1E293B]/50 border-[#22C55E]/40 text-[#22C55E]'
                : 'bg-[#111827] border-[#334155] text-[#64748B]'
            }`}
          >
            <span className="text-xs font-mono font-bold block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Submit Error Box if present */}
      {submitError && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-start space-x-3 animate-in fade-in">
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold font-mono uppercase block">Submission Error</span>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl space-y-6">
        
        {/* STEP 1: Select Asset */}
        {currentStep === 1 && (
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

            {/* Selected Asset Context Preview Card */}
            {selectedAsset && (
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#334155] flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#F97316] shrink-0 font-mono font-bold text-xs">
                  #{assetTag}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-bold text-white truncate">{assetName}</h4>
                  <p className="text-[#94A3B8] truncate">{location}</p>
                  <span className="text-[10px] text-[#64748B] uppercase font-mono">{assetType}</span>
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
                placeholder="e.g. Projector lamp not turning on, paper jam tray 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
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
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#334155] text-[#F9FAFB] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#F97316] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3 rounded-xl font-semibold text-sm bg-[#111827] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
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

            {/* Submission Review Summary Card */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#334155] text-xs space-y-2">
              <div className="flex justify-between text-[#64748B]">
                <span>Target Asset:</span>
                <span className="font-mono text-white">#{assetTag} ({assetName})</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Asset Database ID:</span>
                <span className="font-mono text-white">id={selectedAssetId}</span>
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
                    <span>Submit Maintenance Request</span>
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
