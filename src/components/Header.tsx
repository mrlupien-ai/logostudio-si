import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  FolderKanban,
  FileCode2,
  Shuffle,
  Search,
  Globe,
  FolderArchive,
  MoreHorizontal,
  Send,
  Loader2,
} from 'lucide-react';
import { TLDWATCH_223_DOMAINS } from '../data/domains';

interface HeaderProps {
  domainInput: string;
  setDomainInput: (val: string) => void;
  onApplyDomain: (domain: string) => void;
  onRemix10: () => void;
  onOpenPortfolio: () => void;
  onOpenLanding?: () => void;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  onDownloadBrandKit: () => void;
  onExport10Zip: () => void;
  /** Present only when the ExitFlip extension answered the ping; otherwise nothing about ExitFlip is rendered. */
  onSendToExitflip?: () => void;
  isSendingToExitflip?: boolean;
  copiedSvg: boolean;
  isExporting: boolean;
  isExporting10: boolean;
  nicheLabel: string;
  wordCount: number;
  remixMode: 'core-focus' | 'deep-semantic';
  onChangeRemixMode: (mode: 'core-focus' | 'deep-semantic') => void;
  semanticPoolCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  domainInput,
  setDomainInput,
  onApplyDomain,
  onRemix10,
  onOpenPortfolio,
  onOpenLanding,
  onCopySvg,
  onDownloadSvg,
  onDownloadBrandKit,
  onExport10Zip,
  onSendToExitflip,
  isSendingToExitflip = false,
  copiedSvg,
  isExporting,
  isExporting10,
  nicheLabel,
  wordCount,
  remixMode,
  onChangeRemixMode,
  semanticPoolCount,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainInput.trim()) {
      onApplyDomain(domainInput.trim());
    }
  };

  return (
    <header className="h-[54px] shrink-0 w-full bg-[#0B0F17]/95 backdrop-blur-xl border-b border-white/[0.07] px-2.5 sm:px-3.5 flex items-center justify-between gap-2 z-40 select-none">
      {/* LEFT: Brand Mark + Portfolio Selector */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
        <div
          className="flex items-center gap-2 shrink-0"
          title="Superintelligent Brand Architecture Engine"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-emerald-400/20 border border-indigo-500/35 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[13px] tracking-tight text-[#F8FAFC] whitespace-nowrap">
                LogoStudio
              </span>
              <span
                title="Superintelligent Brand Architecture Engine"
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold text-[#00E5A3] bg-gradient-to-r from-indigo-500/25 to-emerald-400/25 border border-emerald-400/40 tracking-wider"
              >
                .si
              </span>
              <span className="hidden 2xl:inline-block text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                STUDIO PRO
              </span>
            </div>
            <p className="text-[9px] text-slate-400 hidden 2xl:block truncate max-w-[230px]">
              Negative Space Vectors · SVG &amp; Brand Kit Exporter
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.07] hidden lg:block shrink-0" />

        {/* Compact Portfolio Quick-Jump Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#070A10] border border-white/[0.08] rounded-lg px-2 py-1 min-w-0">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 shrink-0 hidden xl:inline">
            NICHE:
          </span>
          <select
            aria-label="Select portfolio domain"
            value={
              TLDWATCH_223_DOMAINS.includes(domainInput.toLowerCase())
                ? domainInput.toLowerCase()
                : ''
            }
            onChange={(e) => {
              if (e.target.value) {
                setDomainInput(e.target.value);
                onApplyDomain(e.target.value);
              }
            }}
            className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate"
          >
            <option value="" disabled className="bg-[#0B0F17] text-slate-400">
              Select Domain...
            </option>
            {TLDWATCH_223_DOMAINS.map((d) => (
              <option key={d} value={d} className="bg-[#0B0F17] text-slate-200">
                {d}
              </option>
            ))}
          </select>
          <span
            title={nicheLabel}
            className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium truncate max-w-[130px] hidden 2xl:inline-block"
          >
            {nicheLabel}
          </span>
        </div>
      </div>

      {/* CENTER: Omnibox Command Pill */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 bg-[#070A10] border border-white/[0.09] rounded-xl p-1 shadow-inner min-w-0 flex-1 max-w-[600px]"
      >
        <div className="relative flex items-center flex-1 min-w-[110px]">
          <Search className="w-3.5 h-3.5 text-slate-500 ml-2 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter domain (e.g. adstock.org)..."
            className="bg-transparent pl-1.5 pr-1.5 py-1 text-xs font-bold text-white placeholder-slate-500 focus:outline-none w-full min-w-0 truncate"
          />
          <span className="hidden sm:inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.06] mr-1 shrink-0">
            {wordCount}-WORD
          </span>
        </div>

        {/* Core 10 vs Deep Semantic Toggle (Desktop) */}
        <div className="hidden xl:flex items-center bg-[#0B0F17] p-0.5 rounded-lg border border-white/[0.07] shrink-0">
          <button
            type="button"
            onClick={() => onChangeRemixMode('core-focus')}
            title="Core 10 curated symbols"
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer whitespace-nowrap ${
              remixMode === 'core-focus'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Core 10
          </button>
          <button
            type="button"
            onClick={() => onChangeRemixMode('deep-semantic')}
            title={`Deep Semantic (${semanticPoolCount} symbols)`}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
              remixMode === 'deep-semantic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            Deep ({semanticPoolCount})
          </button>
        </div>

        <button
          type="submit"
          title="Generate 10 Bespoke Concepts"
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[11px] font-bold text-white flex items-center gap-1 transition shadow-[0_2px_12px_rgba(99,102,241,0.35)] cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span className="hidden md:inline">Generate 10 Concepts</span>
          <span className="md:hidden">Generate</span>
        </button>

        <button
          type="button"
          onClick={onRemix10}
          title="Remix 10 Architectures & Palettes"
          className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition cursor-pointer shrink-0"
        >
          <Shuffle className="w-3 h-3 shrink-0" />
          <span className="hidden 2xl:inline">Remix</span>
        </button>
      </form>

      {/* RIGHT: Primary Export Actions + Responsive More Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Desktop (>=1280px) Secondary Actions: Icon+Text at >=1536px, Icon-only at 1280-1535px */}
        {onOpenLanding && (
          <button
            type="button"
            onClick={onOpenLanding}
            title="LogoStudio.si Landing Page"
            className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/15 to-emerald-500/15 hover:from-indigo-500/25 hover:to-emerald-500/25 border border-indigo-500/35 text-[11px] font-bold text-white items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden 2xl:inline">Landing Page</span>
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
              .SI
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPortfolio}
          title="Browse & Batch Export 223 Portfolio Domains"
          className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-slate-200 items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
        >
          <FolderKanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden 2xl:inline">Portfolio</span>
          <span className="text-[10px] text-slate-400 font-mono">(223)</span>
        </button>

        <button
          type="button"
          onClick={onCopySvg}
          title="Copy Self-Contained Vector SVG Code"
          className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-slate-200 items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
        >
          {copiedSvg ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className="hidden 2xl:inline">{copiedSvg ? 'Copied!' : 'Copy SVG'}</span>
        </button>

        <button
          type="button"
          onClick={onDownloadSvg}
          title="Download Master Vector SVG (Embedded Font)"
          className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-slate-200 items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
        >
          <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden 2xl:inline">Vector SVG</span>
        </button>

        <button
          type="button"
          onClick={onExport10Zip}
          disabled={isExporting10}
          title="Export all 10 concepts (.ZIP)"
          className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[11px] font-bold text-emerald-300 items-center gap-1.5 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          <FolderArchive className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden 2xl:inline">
            {isExporting10 ? 'Packing...' : 'Export 10 (.ZIP)'}
          </span>
        </button>

        {onSendToExitflip && (
          <button
            type="button"
            onClick={onSendToExitflip}
            disabled={isSendingToExitflip}
            title={isSendingToExitflip ? 'Sending…' : 'Send to ExitFlip (1500×900 + 1200×1200 logos)'}
            aria-label="Send to ExitFlip"
            className="hidden min-[1800px]:flex p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-100 items-center transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {isSendingToExitflip ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <Send className="w-4 h-4 shrink-0" />}
          </button>
        )}

        {/* Primary CTA: Brand Kit (.ZIP) — Always visible */}
        <button
          type="button"
          onClick={onDownloadBrandKit}
          disabled={isExporting}
          title="Download Complete Brand Kit (.ZIP)"
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[11px] font-extrabold text-slate-950 flex items-center gap-1.5 transition shadow-[0_2px_14px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {isExporting ? 'Packaging...' : 'Brand Kit (.ZIP)'}
          </span>
        </button>

        {/* Compact "⋯ More" Dropdown Menu for <1280px viewports */}
        <div className="relative xl:hidden" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More Studio Actions"
            title="More Studio Actions"
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0D131F] border border-white/[0.12] shadow-2xl p-2 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                Studio Actions &amp; Exports
              </div>
              {onOpenLanding && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenLanding();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-white flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Landing Page (.SI)
                  </span>
                </button>
              )}
              {onSendToExitflip && (
                <button
                  type="button"
                  disabled={isSendingToExitflip}
                  onClick={() => {
                    setMoreOpen(false);
                    onSendToExitflip();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-indigo-100 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-300" />
                  {isSendingToExitflip ? 'Sending…' : 'Send to ExitFlip'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onOpenPortfolio();
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-slate-200 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                  Portfolio Domains
                </span>
                <span className="text-[10px] font-mono text-slate-400">223</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onCopySvg();
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                {copiedSvg ? 'Copied SVG!' : 'Copy Vector SVG'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onDownloadSvg();
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                Download Vector SVG
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onExport10Zip();
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs font-semibold text-emerald-300 flex items-center gap-2 cursor-pointer"
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
                Export All 10 Concepts (.ZIP)
              </button>
              <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChangeRemixMode('core-focus')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    remixMode === 'core-focus'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/[0.04] text-slate-400'
                  }`}
                >
                  Core 10
                </button>
                <button
                  type="button"
                  onClick={() => onChangeRemixMode('deep-semantic')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    remixMode === 'deep-semantic'
                      ? 'bg-amber-500/25 text-amber-300'
                      : 'bg-white/[0.04] text-slate-400'
                  }`}
                >
                  Deep ({semanticPoolCount})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
