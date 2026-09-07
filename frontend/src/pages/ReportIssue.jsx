import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { MOCK_ASSETS } from '../data/mockData';

export default function ReportIssue() {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('assetTag') || 'PRJ-205';

  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Matched asset for preview
  const selectedAsset = MOCK_ASSETS.find(a => a.assetTag === selectedTag) || MOCK_ASSETS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Simulate ticket creation
    const generatedId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generatedId);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setTitle('');
    setDescription('');
    setPriority('High');
    setCurrentStep(1);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto shadow-lg shadow-[#22C55E]/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-bold uppercase tracking-wider">
            Ticket Logged
          </div>
          <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
            Issue Reported Successfully
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Your maintenance request has been recorded into FixTag and flagged for campus facilities.
          </p>
        </div>

        {/* Ticket Summary Card */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] text-left space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <span className="text-xs font-mono text-[#64748B] uppercase">Ticket Number</span>
            <span className="font-mono text-sm font-extrabold text-[#F97316]">{ticketId}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block">Asset</span>
              <span className="font-bold text-[#F9FAFB]">#{selectedAsset.assetTag} ({selectedAsset.name})</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Location</span>
              <span className="text-[#F9FAFB] font-medium">{selectedAsset.location}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Fault Title</span>
              <span className="text-[#F9FAFB] font-medium truncate block">{title}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Priority</span>
              <span className="text-[#F97316] font-bold uppercase">{priority}</span>
            </div>
          </div>
        </div>

        {/* Post-submit Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md shadow-[#F97316]/20 transition-all"
          >
            Go to Command Center
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
          Log a physical equipment problem for technician dispatch.
        </p>
      </div>

      {/* Structured Multi-Step Progress Tracker */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { step: 1, label: "1. Select Asset" },
          { step: 2, label: "2. Describe Fault" },
          { step: 3, label: "3. Set Priority" },
        ].map(s => (
          <div
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
              currentStep === s.step
                ? 'bg-[#1E293B] border-[#F97316] text-[#F9FAFB]'
                : currentStep > s.step
                ? 'bg-[#1E293B]/50 border-[#22C55E]/40 text-[#22C55E]'
                : 'bg-[#111827] border-[#334155] text-[#64748B]'
            }`}
          >
            <span className="text-xs font-mono font-bold block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl space-y-6">
        
        {/* STEP 1: Select Asset */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5 font-semibold">
                Select Physical Asset
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#334155] text-[#F9FAFB] font-mono text-sm focus:outline-none focus:border-[#F97316] transition-colors"
              >
                {MOCK_ASSETS.map((a) => (
                  <option key={a.assetTag} value={a.assetTag}>
                    #{a.assetTag} — {a.name} ({a.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Asset Context Card */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#334155] flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#F97316] shrink-0 font-mono font-bold text-xs">
                #{selectedAsset.assetTag}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <h4 className="font-bold text-white truncate">{selectedAsset.name}</h4>
                <p className="text-[#94A3B8] truncate">{selectedAsset.location}</p>
                <span className="text-[10px] text-[#64748B] uppercase font-mono">{selectedAsset.assetType}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-colors shadow-md shadow-[#F97316]/20"
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
                placeholder="e.g. Projector lamp not powering on, loose leg bolt"
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
                placeholder="Describe symptoms, noise, warning lights, or hazards noticed..."
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
                  if (title.trim() && description.trim()) setCurrentStep(3);
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
                  { id: "Low", label: "Low", desc: "Cosmetic / Non-blocking", color: "border-[#334155] hover:border-[#94A3B8]" },
                  { id: "Medium", label: "Medium", desc: "Partial functionality", color: "border-[#FBBF24]/50 hover:border-[#FBBF24]" },
                  { id: "High", label: "High", desc: "Blocks class or lecture", color: "border-[#F97316]/50 hover:border-[#F97316]" },
                  { id: "Critical", label: "Critical", desc: "Safety hazard or outage", color: "border-[#EF4444]/50 hover:border-[#EF4444]" },
                ].map(p => (
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

            {/* Submission Review Summary */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#334155] text-xs space-y-2">
              <div className="flex justify-between text-[#64748B]">
                <span>Target Asset:</span>
                <span className="font-mono text-white">#{selectedAsset.assetTag}</span>
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
                className="px-4 py-3 rounded-xl font-semibold text-sm bg-[#111827] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#F97316]/25"
              >
                <span>Submit Maintenance Request</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
