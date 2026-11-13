import React from 'react';
import {
  Sparkles,
  Download,
  Code,
  FolderArchive,
  Briefcase,
  Check,
  Globe,
  Search,
  RefreshCw,
} from 'lucide-react';
import { LogoState } from '../types/logo';
import { TLDWATCH_223_DOMAINS } from '../data/domains';
import { downloadBrandKitZip, downloadSvg, copySvgCode } from '../utils/exporter';

interface HeaderProps {
  state: LogoState;
  onDomainChange: (domain: string) => void;
  onSelectPortfolioDomain?: (domain: string) => void;
  onGenerate: () => void;
  onRemix?: () => void;
  onToggleWordMode: () => void;
  onOpenPortfolio: () => void;
  onOpenVault: () => void;
  onOpenAiPanel: () => void;
  onOpenLandingMockup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onDomainChange,
  onSelectPortfolioDomain,
  onGenerate,
  onRemix,
  onToggleWordMode,
  onOpenPortfolio,
  onOpenLandingMockup,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleCopySvg = async () => {
    const success = await copySvgCode(state);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadKit = async () => {
    setIsExporting(true);
    try {
      await downloadBrandKitZip(state);
    } finally {
      setIsExporting(false);
    }
  };

  const isTwoWords = Boolean(state.word2 && state.word2.trim().length > 0);

  return (
    <header className="h-[54px] shrink-0 bg-[#0B0E17]/95 backdrop-blur-md border-b border-white/[0.07] px-3 flex items-center justify-between gap-2 z-40">
      {/* Left: Brand Identity + Domain Portfolio Switcher + Niche Pill */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-cyan-500/20 border border-indigo-500/40 flex items-center justify-center shadow-inner shrink-0">
            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="leading-none hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[14px] tracking-tight text-[#F8FAFC]">
                LogoStudio<span className="text-[#00E5A3]">.si</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/15 text-[#818CF8] border border-indigo-500/30 font-semibold hidden xl:inline-block">
                VECTOR &amp; IDENTITY CRAFT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight mt-0.5 hidden 2xl:block">
              Negative Space Vectors · Typographic Contrast · SVG &amp; Brand Kit Exporter
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.07] mx-0.5 hidden md:block" />

        {/* Domain Quick Switcher & Active Industry Niche Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#06080D] border border-white/[0.07] rounded-lg px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <select
            value={state.domain}
            onChange={(e) => {
              const dom = e.target.value;
              if (onSelectPortfolioDomain) {
                onSelectPortfolioDomain(dom);
              } else {
                onDomainChange(dom);
              }
            }}
            aria-label="Select Portfolio Domain"
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate"
          >
            {!TLDWATCH_223_DOMAINS.includes(state.domain) && (
              <option value={state.domain} className="bg-[#0B0E17] text-white">
                {state.domain}
              </option>
            )}
            {TLDWATCH_223_DOMAINS.map((dom) => (
              <option key={dom} value={dom} className="bg-[#0B0E17] text-white">
                {dom}
              </option>
            ))}
          </select>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 truncate max-w-[165px] hidden lg:inline-block"
            title={state.nicheLabel}
          >
            {state.nicheLabel}
          </span>
        </div>
      </div>

      {/* Center: Omnibox Command Bar */}
      <div className="flex items-center gap-1.5 bg-[#06080D] border border-white/[0.09] focus-within:border-indigo-500/70 rounded-xl p-1 pl-2.5 shadow-inner flex-1 max-w-[460px] min-w-0">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={state.domain}
          onChange={(e) => onDomainChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onGenerate();
          }}
          placeholder="Enter domain or brand (e.g. adstock.org)..."
          className="bg-transparent text-xs font-mono font-semibold text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[60px]"
        />
        <button
          type="button"
          onClick={onToggleWordMode}
          title="Toggle 1-Word vs 2-Word Compound Split"
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition cursor-pointer shrink-0"
        >
          {isTwoWords ? '2-WORD' : '1-WORD'}
        </button>
        {onRemix && (
          <button
            type="button"
            onClick={onRemix}
            title="Remix 10 Concepts & Architectures"
            className="h-7 px-2 rounded-lg bg-[#101522] hover:bg-white/[0.08] border border-white/[0.07] text-[11px] font-semibold text-amber-300 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Remix</span>
          </button>
        )}
        <button
          type="button"
          onClick={onGenerate}
          className="btn-glow bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md cursor-pointer shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          <span>Generate 10 Concepts</span>
        </button>
      </div>

      {/* Right: Studio Global Quick Export & Utility Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenLandingMockup && (
          <button
            type="button"
            onClick={onOpenLandingMockup}
            className="h-8 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Switch to LogoStudio.si SaaS Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">Landing Page</span>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-200 px-1 py-0.2 rounded">.SI</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPortfolio}
          className="h-8 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          title="Browse 223 Portfolio Domains"
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">Portfolio</span>
          <span className="text-[10px] font-mono text-slate-400">(223)</span>
        </button>

        <div className="h-5 w-px bg-white/[0.07] mx-0.5 hidden sm:block" />

        <button
          type="button"
          onClick={handleCopySvg}
          className="h-8 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          title="Copy Master Vector SVG Code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 hidden md:inline">Copied SVG</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Copy SVG</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => downloadSvg(state, `${state.domain || 'logo'}-master.svg`)}
          className="h-8 px-2.5 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          title="Download Vector SVG"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Vector SVG</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadKit}
          disabled={isExporting}
          className="h-8 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          title="Download Complete Brand Kit (.ZIP)"
        >
          <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isExporting ? 'Packing...' : 'Brand Kit (.ZIP)'}</span>
        </button>
      </div>
    </header>
  );
};
