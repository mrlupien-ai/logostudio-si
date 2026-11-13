import React from 'react';
import { Layers, Sparkles, FolderArchive, Download, Code, Check, Globe } from 'lucide-react';
import { LogoState } from '../types/logo';
import { copySvgCode, downloadBrandKitZip, downloadSvg } from '../utils/exporter';

interface HeaderProps {
  state: LogoState;
  onDomainChange: (domain: string) => void;
  onGenerate: () => void;
  onToggleWordMode: () => void;
  onOpenPortfolio: () => void;
  onOpenVault: () => void;
  onOpenAiPanel: () => void;
  onOpenLandingMockup?: () => void;
  isGenerating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onDomainChange,
  onGenerate,
  onToggleWordMode,
  onOpenPortfolio,
  onOpenVault,
  onOpenAiPanel,
  onOpenLandingMockup,
}) => {
  const [copiedSvg, setCopiedSvg] = React.useState(false);
  const [isZipping, setIsZipping] = React.useState(false);
  const [zipStatus, setZipStatus] = React.useState('');

  const isSingleWord = !state.word2 || state.word2.trim() === '';

  const handleCopySvg = async () => {
    const success = await copySvgCode(state, { background: 'transparent' });
    if (success) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const handleDownloadBrandKit = async () => {
    try {
      setIsZipping(true);
      await downloadBrandKitZip(state, (msg) => setZipStatus(msg));
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
      setZipStatus('');
    }
  };

  return (
    <header className="border-b border-[#1b2333] bg-[#080b13]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1840px] mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-[#080b13] rounded-[11px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm lg:text-base tracking-tight text-white whitespace-nowrap">
                ATOMLOGO <span className="text-indigo-400 font-light">STUDIO</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 border-l border-slate-700/60 pl-2 hidden sm:inline">
                Vector &amp; Identity Craft
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden md:block">
              Negative Space Vectors · Typographic Contrast · SVG &amp; Brand Kit Exporter
            </p>
          </div>
        </div>

        {/* Central Domain Quick Action Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xl mx-auto min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={state.domain}
              onChange={(e) => onDomainChange(e.target.value)}
              onBlur={() => onGenerate()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onGenerate();
              }}
              placeholder="Enter domain or brand (e.g. adstock.org, findimage.net)..."
              className="w-full bg-[#06080f] border border-[#232c42] focus:border-indigo-500 rounded-xl pl-3.5 pr-20 py-2 text-xs lg:text-sm text-white font-bold outline-none transition shadow-inner"
            />
            <button
              type="button"
              onClick={onToggleWordMode}
              title="Click to toggle 1-Word vs 2-Word split"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
            >
              {isSingleWord ? '1-Word' : '2-Word'}
            </button>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate 10 Concepts</span>
          </button>
        </div>

        {/* Action Controls & Vector Exports */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenLandingMockup && (
            <button
              type="button"
              onClick={onOpenLandingMockup}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/35 flex items-center gap-1.5 transition cursor-pointer"
              title="Preview LogoStudio.si Landing Page Mockup"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Landing Page</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">.SI</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPortfolio}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#111726] hover:bg-[#182137] text-slate-200 border border-[#232d44] flex items-center gap-1.5 transition cursor-pointer"
            title="Browse all 223 domains from tldwatch.csv"
          >
            <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Portfolio</span>
            <span className="text-[10px] text-slate-400">(223)</span>
          </button>

          <button
            type="button"
            onClick={handleCopySvg}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#111726] hover:bg-[#182137] text-slate-200 border border-[#232d44] flex items-center gap-1.5 transition cursor-pointer"
            title="Copy scalable vector SVG code to clipboard"
          >
            {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden md:inline">{copiedSvg ? 'SVG Copied!' : 'Copy SVG'}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSvg(state, `${state.domain || 'logo'}-vector.svg`)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#111726] hover:bg-[#182137] text-slate-200 border border-[#232d44] flex items-center gap-1.5 transition cursor-pointer"
            title="Download pure vector SVG"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vector SVG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBrandKit}
            disabled={isZipping}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Download complete Brand Package (.ZIP) with SVGs, PNGs, and JSON specs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? (zipStatus || 'Exporting...') : 'Brand Kit (.ZIP)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
