import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AssetRegistry from './pages/AssetRegistry';
import AssetDetail from './pages/AssetDetail';
import Issues from './pages/Issues';
import ScanToFix from './pages/ScanToFix';
import ReportIssue from './pages/ReportIssue';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] flex flex-col selection:bg-[#F97316] selection:text-white">
        {/* Persistent Top Navigation Bar */}
        <Navbar />

        {/* Core Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetRegistry />} />
            <Route path="/assets/:assetTag" element={<AssetDetail />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/scan" element={<ScanToFix />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Industrial Tech Footer */}
        <footer className="border-t border-[#334155]/60 bg-[#0F172A] py-6 px-4 text-center text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F9FAFB]">Fix<span className="text-[#F97316]">Tag</span></span>
              <span>—</span>
              <span className="text-[#94A3B8]">The digital maintenance layer for physical spaces</span>
            </div>
            <div className="flex items-center space-x-3 font-mono text-[11px]">
              <span className="text-[#F97316]">SCAN</span>
              <span>→</span>
              <span className="text-[#FBBF24]">REPORT</span>
              <span>→</span>
              <span className="text-[#38BDF8]">TRACK</span>
              <span>→</span>
              <span className="text-[#22C55E]">FIX</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
