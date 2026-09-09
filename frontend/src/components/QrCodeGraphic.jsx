import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Tag, MapPin, Download, Check, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * FixTag Dynamic Physical QR Inspection Tag Component
 * Generates an optically-scannable QR code encoding the FixTag asset report URL:
 * Pattern: /report/{asset_tag}
 */
export default function QrCodeGraphic({
  tag = 'PRJ-204',
  name = '',
  location = '',
  size = 'md',
  showActions = false,
  showMetadata = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  // Dynamic destination URL pointing to the asset's report route
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const destinationUrl = `${baseUrl}/report/${tag}`;

  // Pixel dimension for the QRCodeCanvas based on size prop
  const pixelSize = size === 'sm' ? 68 : size === 'lg' ? 170 : size === 'xl' ? 210 : 120;

  // Clean filename for downloading
  const downloadFileName = `FixTag-QR-${tag}.png`;

  const handleDownload = (e) => {
    e.stopPropagation();
    const canvas = document.getElementById(`qr-canvas-${tag}`);
    if (!canvas) return;

    // Convert canvas directly to high-res PNG data URL
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = downloadFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(destinationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`inline-flex flex-col items-center p-3.5 rounded-2xl bg-[#0F172A] border border-[#334155] shadow-lg text-center ${className}`}
    >
      {/* Industrial Tag Header */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#334155]/60 text-[10px] font-mono text-[#94A3B8]">
        <span className="flex items-center space-x-1">
          <Tag className="w-3 h-3 text-[#F97316]" />
          <span className="font-bold text-[#F9FAFB] tracking-wider">#{tag}</span>
        </span>
        <span className="text-[9px] uppercase tracking-widest font-semibold text-[#F97316]">
          Fix<span className="text-[#94A3B8]">Tag</span>
        </span>
      </div>

      {/* Scannable QR Matrix (High-contrast white container for reliable camera recognition) */}
      <div className="p-2 bg-white rounded-xl shadow-inner inline-block transition-transform hover:scale-[1.02]">
        <QRCodeCanvas
          id={`qr-canvas-${tag}`}
          value={destinationUrl}
          size={pixelSize}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#0F172A"
          includeMargin={false}
        />
      </div>

      {/* Subtitle / Scan prompt */}
      <div className="mt-2 text-[10px] font-mono text-[#94A3B8] tracking-wide uppercase">
        Scan to report fault
      </div>

      {/* Optional Metadata: Asset Name & Location */}
      {showMetadata && (name || location) && (
        <div className="mt-2 pt-2 border-t border-[#334155]/60 w-full text-left space-y-0.5">
          {name && (
            <div className="text-xs font-semibold text-[#F9FAFB] truncate">
              {name}
            </div>
          )}
          {location && (
            <div className="flex items-center space-x-1 text-[11px] text-[#64748B]">
              <MapPin className="w-3 h-3 text-[#F97316] shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Download QR & Copy Link */}
      {showActions && (
        <div className="mt-3 pt-2.5 border-t border-[#334155]/60 w-full flex items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#F9FAFB] border border-[#334155] transition-colors text-[11px] font-medium"
            title="Download QR code image as PNG"
          >
            <Download className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] transition-colors text-[11px]"
            title="Copy Report URL"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
