import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Code2,
  Check,
  Copy,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Zap,
  Globe,
  FileCode2,
  Palette,
  Type,
  AlertTriangle,
} from 'lucide-react';
import { LogoState } from '../../types/logo';
import { evaluateDomainBrandability } from '../../utils/siBrandIntelligence';
import { getClosestPantone, getWcagContrast, hexToRgb, rgbToCmyk } from '../../utils/color';
import { generateFullLogoSvg, buildEmblemSvgMarkup } from '../../utils/svgBuilder';
import {
  downloadBlob,
  downloadFaviconSuiteZip,
  generateBrandGuidelinesHtml,
  generateCssDesignTokens,
  generateReactLogoComponentCode,
  generateSeoJsonLdHead,
} from '../../utils/exporter';

interface SiBrandBookStageProps {
  state: LogoState;
  onChange: (partial: Partial<LogoState>) => void;
}

export const SiBrandBookStage: React.FC<SiBrandBookStageProps> = ({ state, onChange }) => {
  const [activeModule, setActiveModule] = useState<'scorecard' | 'brand-book' | 'dev-handoff'>(
    'scorecard'
  );
  const [devTab, setDevTab] = useState<'react' | 'tokens' | 'seo' | 'favicons'>('react');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingHtml, setExportingHtml] = useState(false);
  const [exportingFavicons, setExportingFavicons] = useState(false);

  const report = useMemo(
    () =>
      evaluateDomainBrandability(
        state.domain,
        state.word1,
        state.word2,
        state.ext,
        state.nicheLabel
      ),
    [state.domain, state.word1, state.word2, state.ext, state.nicheLabel]
  );

  const swatches = useMemo(() => {
    return [
      { role: 'Primary Ink', token: '--brand-primary', hex: state.primary },
      { role: 'Brand Accent', token: '--brand-secondary', hex: state.secondary },
      { role: 'Spark Point', token: '--brand-accent', hex: state.accent },
    ].map((s) => {
      const [r, g, b] = hexToRgb(s.hex);
      const cmyk = rgbToCmyk(r, g, b);
      const pms = getClosestPantone(s.hex);
      const onWhite = getWcagContrast(s.hex, '#FFFFFF');
      const onDark = getWcagContrast(s.hex, '#0B0F17');
      return { ...s, r, g, b, cmyk, pms, onWhite, onDark };
    });
  }, [state.primary, state.secondary, state.accent]);

  const svgHorizontalLight = useMemo(
    () => generateFullLogoSvg(state, { width: 750, height: 450, background: 'white' }),
    [state]
  );
  const svgHorizontalDark = useMemo(
    () => generateFullLogoSvg(state, { width: 750, height: 450, background: 'dark' }),
    [state]
  );
  const svgSquareLight = useMemo(
    () => generateFullLogoSvg(state, { width: 600, height: 600, background: 'white' }),
    [state]
  );
  const emblemSvg = useMemo(
    () =>
      buildEmblemSvgMarkup(
        {
          containerStyle: state.containerStyle,
          construction: state.construction,
          activeIcon: state.activeIcon,
          secondaryIcon: state.secondaryIcon,
          emblemFusion: state.emblemFusion,
          customSvgPath: state.customSvgPath,
          primary: state.primary,
          secondary: state.secondary,
          accent: state.accent,
          fontFamily: state.fontFamily,
          word1: state.word1,
          iconStrokeWidth: state.iconStrokeWidth,
          iconRotation: state.iconRotation,
          iconFlipH: state.iconFlipH,
          iconFlipV: state.iconFlipV,
        },
        200
      ),
    [state]
  );

  const reactCode = useMemo(() => generateReactLogoComponentCode(state), [state]);
  const tokensCode = useMemo(() => generateCssDesignTokens(state), [state]);
  const seoCode = useMemo(() => generateSeoJsonLdHead(state), [state]);

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCodeFile = (content: string, filename: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    downloadBlob(blob, filename);
  };

  const handleExportBrandBookHtml = async (openPrint = false) => {
    setExportingHtml(true);
    try {
      const html = await generateBrandGuidelinesHtml(state);
      const base = state.domain.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      if (openPrint) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 2000);
          }, 500);
        }
      } else {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        downloadBlob(blob, `Brand-Guidelines-${base}.html`);
      }
    } finally {
      setExportingHtml(false);
    }
  };

  const handleDownloadFavicons = async () => {
    setExportingFavicons(true);
    try {
      await downloadFaviconSuiteZip(state);
    } finally {
      setExportingFavicons(false);
    }
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto flex flex-col gap-6 pb-10">
      {/* Top Sub-Navigation Banner */}
      <div className="bg-[#0C121D]/95 border border-white/[0.08] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                .SI Brand Architecture & Developer Handoff
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {report.marketTier}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic linguistic scorecard, 6-slide A4 landscape Brand Book, and production code suite for{' '}
              <span className="text-slate-200 font-mono font-semibold">{state.domain}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#070A10] p-1 rounded-xl border border-white/[0.07]">
          <button
            onClick={() => setActiveModule('scorecard')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeModule === 'scorecard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            1. .SI Scorecard & Taglines
          </button>
          <button
            onClick={() => setActiveModule('brand-book')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeModule === 'brand-book'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            2. 6-Slide Brand Book
          </button>
          <button
            onClick={() => setActiveModule('dev-handoff')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeModule === 'dev-handoff'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            3. Dev Handoff & Favicons
          </button>
        </div>
      </div>

      {/* =====================================================================
          MODULE A: .SI BRAND INTELLIGENCE SCORECARD & TAGLINE GENERATOR
         ===================================================================== */}
      {activeModule === 'scorecard' && (
        <div className="flex flex-col gap-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Visual Symmetry */}
            <div className="bg-[#0D131F] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                  <span>VISUAL SYMMETRY</span>
                  <span className="font-mono text-indigo-300">{report.visualSymmetry.length} chars</span>
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {report.visualSymmetry.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 10</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${report.visualSymmetry.score * 10}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-2 border-t border-white/[0.05]">
                <div>Axial Glyph Ratio: {report.visualSymmetry.symmetricRatio}%</div>
                <div>
                  Ascenders / Descenders: {report.visualSymmetry.ascenders}:
                  {report.visualSymmetry.descenders} · Bowls: {report.visualSymmetry.bowlCount}
                </div>
              </div>
            </div>

            {/* 2. Phonetic Flow */}
            <div className="bg-[#0D131F] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                  <span>PHONETIC FLOW</span>
                  <span className="font-mono text-emerald-300">
                    {report.phoneticFlow.syllables} syll
                  </span>
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {report.phoneticFlow.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 10</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${report.phoneticFlow.score * 10}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-2 border-t border-white/[0.05]">
                <div>Cadence: {report.phoneticFlow.cadenceLabel}</div>
                <div>C/V Alternation: {report.phoneticFlow.alternationRatio}%</div>
              </div>
            </div>

            {/* 3. TLD Authority */}
            <div className="bg-[#0D131F] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                  <span>TLD AUTHORITY</span>
                  <span className="font-mono text-sky-300 uppercase">{report.tldAuthority.ext}</span>
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {report.tldAuthority.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 10</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${report.tldAuthority.score * 10}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.05] leading-snug">
                {report.tldAuthority.rationale}
              </div>
            </div>

            {/* 4. Composite .SI Brand Index */}
            <div className="bg-gradient-to-br from-indigo-950/50 to-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold mb-1">
                  <span>.SI BRAND INDEX</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">
                    WEIGHTED
                  </span>
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-extrabold font-mono text-emerald-300">
                    {report.brandIndex.toFixed(1)}
                  </span>
                  <span className="text-xs text-emerald-400/70 font-mono">/ 10</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full"
                    style={{ width: `${report.brandIndex * 10}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-300 font-mono pt-2 border-t border-white/[0.08]">
                {report.marketTier}
              </div>
            </div>
          </div>

          {/* Two Columns: 5 Archetype Taglines + Executive Positioning Pitch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 5 Archetype Taglines */}
            <div className="lg:col-span-7 bg-[#0D131F] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    5 Deterministic Brand Archetype Taglines
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &ldquo;Apply to Logo&rdquo; to render any tagline live on the Master Canvas and SVG exports
                  </p>
                </div>
                {state.showTagline && state.tagline && (
                  <button
                    onClick={() => onChange({ showTagline: false })}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-semibold text-slate-300 cursor-pointer"
                  >
                    Hide Active Tagline
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {report.archetypeTaglines.map((item) => {
                  const isActive = state.showTagline && state.tagline === item.tagline;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-600/15 border-indigo-500/50'
                          : 'bg-[#090D15] border-white/[0.06] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                          {item.archetype}
                        </div>
                        <div className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                          &ldquo;{item.tagline}&rdquo;
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onChange({
                            tagline: item.tagline,
                            showTagline: true,
                          })
                        }
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isActive ? '✓ Applied' : 'Apply to Logo'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Executive Brand Positioning Pitch */}
            <div className="lg:col-span-5 bg-[#0D131F] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      Executive Brand Positioning Summary
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Formula-backed linguistic & market thesis
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(report.salesPitch.join('\n\n'), 'sales-pitch')
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'sales-pitch' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Pitch
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
                  <p className="bg-[#090D15] p-3.5 rounded-xl border border-white/[0.05]">
                    {report.salesPitch[0]}
                  </p>
                  <p className="bg-[#090D15] p-3.5 rounded-xl border border-white/[0.05]">
                    {report.salesPitch[1]}
                  </p>
                </div>
              </div>

              {/* Mini Live Lockup Preview */}
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white h-36 flex items-center justify-center p-2">
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE B: 6-SLIDE AGENCY BRAND GUIDELINES BOOK
         ===================================================================== */}
      {activeModule === 'brand-book' && (
        <div className="flex flex-col gap-6">
          {/* Action Bar */}
          <div className="bg-[#0D131F] border border-white/[0.08] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                6-Slide A4 Landscape Brand Guidelines Deck ({state.domain})
              </h3>
              <p className="text-[11px] text-slate-400">
                All 6 slides render live from your active vector geometry, CMYK/Pantone color tables, and WCAG 2.1 contrast checks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportBrandBookHtml(false)}
                disabled={exportingHtml}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {exportingHtml ? 'Building HTML...' : 'Export Brand Book (.HTML)'}
              </button>
              <button
                onClick={() => handleExportBrandBookHtml(true)}
                disabled={exportingHtml}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
            </div>
          </div>

          {/* 6 Slides Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* SLIDE 01: Brand Cover */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  SLIDE 01 / BRAND COVER & THESIS
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  INDEX {report.brandIndex}/10
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 items-center">
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {report.marketTier}
                  </span>
                  <h4
                    className="text-2xl font-extrabold text-white"
                    style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                  >
                    {state.domain}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {report.salesPitch[0]}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 h-48 flex items-center justify-center border border-white/10">
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                  />
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-white/[0.05] pt-2">
                <span>Generated by LogoStudio.si</span>
                <span>{state.nicheLabel}</span>
              </div>
            </div>

            {/* SLIDE 02: Construction & Clearspace */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  SLIDE 02 / CONSTRUCTION & CLEARSPACE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  80% SAFE ZONE · 0.25X ISOLATION
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 my-4 items-center">
                <div className="bg-white rounded-xl p-3 h-48 flex items-center justify-center relative">
                  <div className="absolute inset-3 border border-dashed border-rose-500/60 rounded pointer-events-none" />
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                  />
                </div>
                <div className="bg-white rounded-xl p-3 h-48 flex items-center justify-center relative">
                  <div className="absolute inset-3 border border-dashed border-indigo-500/60 rounded pointer-events-none" />
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgSquareLight }}
                  />
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between border-t border-white/[0.05] pt-2">
                <span>Min Digital Height: 24px · Min Print Height: 8mm</span>
                <span>{state.construction?.label || state.containerStyle}</span>
              </div>
            </div>

            {/* SLIDE 03: Color Architecture */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  SLIDE 03 / COLOR ARCHITECTURE (PANTONE · CMYK · WCAG)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                {swatches.map((s) => (
                  <div
                    key={s.role}
                    className="bg-[#080C14] border border-white/[0.07] rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div
                      className="h-16 rounded-lg border border-white/15 mb-2.5"
                      style={{ backgroundColor: s.hex }}
                    />
                    <div className="text-xs font-bold text-white">{s.role}</div>
                    <div className="text-sm font-mono font-extrabold text-indigo-300 mb-1.5">
                      {s.hex.toUpperCase()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                      <div>
                        RGB: {s.r}, {s.g}, {s.b}
                      </div>
                      <div>
                        CMYK: {s.cmyk.c}/{s.cmyk.m}/{s.cmyk.y}/{s.cmyk.k}
                      </div>
                      <div className="text-emerald-300">
                        {s.pms.code} (ΔE {s.pms.deltaE})
                      </div>
                      <div>
                        vs #FFF: {s.onWhite.ratio}:1 ({s.onWhite.levelLabel})
                      </div>
                      <div>
                        vs Dark: {s.onDark.ratio}:1 ({s.onDark.levelLabel})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-white/[0.05] pt-2">
                <span>CIEDE2000 Pantone Solid Coated Approximation</span>
                <span>WCAG 2.1 Verified</span>
              </div>
            </div>

            {/* SLIDE 04: Typography & Scale */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  SLIDE 04 / TYPOGRAPHY & OPTICAL TRACKING
                </span>
                <span className="text-[11px] font-mono text-slate-300">{state.fontFamily}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 items-center">
                <div className="bg-[#080C14] border border-white/[0.06] rounded-xl p-4">
                  <div
                    className="text-4xl font-extrabold text-white mb-2"
                    style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                  >
                    Aa Bb Cc 123
                  </div>
                  <div
                    className="text-xs text-slate-300 tracking-wider mb-3"
                    style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    <br />
                    abcdefghijklmnopqrstuvwxyz
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 space-y-1">
                    <div>
                      Word 1 ({state.word1}): Weight {state.fontWeight1 || '800'} · Tracking{' '}
                      {(state.tracking1Em ?? -0.02).toFixed(3)}em
                    </div>
                    <div>
                      Word 2 ({state.word2 || '—'}): Weight {state.fontWeight2 || '700'} · Tracking{' '}
                      {(state.tracking2Em ?? -0.01).toFixed(3)}em
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 bg-[#080C14] border border-white/[0.06] rounded-xl p-4">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400">H1 DISPLAY · 800</span>
                    <div
                      className="text-xl font-extrabold text-white"
                      style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                    >
                      {state.word1}
                      {state.word2} Platform
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400">H2 SUBHEAD · 700</span>
                    <div
                      className="text-sm font-bold text-slate-200"
                      style={{ fontFamily: `'${state.fontFamily}', sans-serif` }}
                    >
                      {report.archetypeTaglines[0].tagline}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-white/[0.05] pt-2">
                <span>SIL Open Font License (OFL)</span>
                <span>Embedded Subset woff2 Ready</span>
              </div>
            </div>

            {/* SLIDE 05: Surface Matrix */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  SLIDE 05 / APPROVED SURFACE MATRIX
                </span>
                <span className="text-[11px] font-mono text-slate-400">4 SURFACES</span>
              </div>
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="rounded-xl bg-white h-32 p-2 flex items-center justify-center border border-white/10">
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                  />
                </div>
                <div className="rounded-xl bg-[#07090E] h-32 p-2 flex items-center justify-center border border-white/10">
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgHorizontalDark }}
                  />
                </div>
                <div
                  className="rounded-xl h-32 p-2 flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: state.primary }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: svgHorizontalDark }}
                  />
                </div>
                <div className="rounded-xl bg-slate-100 h-32 p-3 flex items-center justify-center border border-white/10">
                  <div
                    className="w-20 h-20 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: emblemSvg }}
                  />
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-white/[0.05] pt-2">
                <span>Daylight White · Obsidian Dark · Brand Primary · Standalone Mark</span>
                <span>{state.domain}</span>
              </div>
            </div>

            {/* SLIDE 06: Misuse Guardrails */}
            <div className="bg-[#0D131F] border border-white/[0.09] rounded-2xl p-6 flex flex-col justify-between min-h-[390px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SLIDE 06 / MISUSE GUARDRAILS
                </span>
                <span className="text-[11px] font-mono text-slate-400">4 PROHIBITED MODIFICATIONS</span>
              </div>
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#080C14] border border-rose-500/30 rounded-xl p-2.5">
                  <div className="text-[10px] font-mono font-bold text-rose-400 mb-1">
                    ✕ Do not stretch non-uniformly
                  </div>
                  <div className="bg-white rounded-lg h-24 flex items-center justify-center overflow-hidden">
                    <div
                      className="w-4/5 h-4/5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      style={{ transform: 'scaleX(1.38) scaleY(0.70)' }}
                      dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                    />
                  </div>
                </div>
                <div className="bg-[#080C14] border border-rose-500/30 rounded-xl p-2.5">
                  <div className="text-[10px] font-mono font-bold text-rose-400 mb-1">
                    ✕ Do not rotate or skew lockup
                  </div>
                  <div className="bg-white rounded-lg h-24 flex items-center justify-center overflow-hidden">
                    <div
                      className="w-4/5 h-4/5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      style={{ transform: 'rotate(-11deg)' }}
                      dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                    />
                  </div>
                </div>
                <div className="bg-[#080C14] border border-rose-500/30 rounded-xl p-2.5">
                  <div className="text-[10px] font-mono font-bold text-rose-400 mb-1">
                    ✕ Do not render low-contrast on dark
                  </div>
                  <div className="bg-[#080B12] rounded-lg h-24 flex items-center justify-center overflow-hidden">
                    <div
                      className="w-4/5 h-4/5 opacity-20 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                    />
                  </div>
                </div>
                <div className="bg-[#080C14] border border-rose-500/30 rounded-xl p-2.5">
                  <div className="text-[10px] font-mono font-bold text-rose-400 mb-1">
                    ✕ Do not alter brand hue ratios
                  </div>
                  <div className="bg-white rounded-lg h-24 flex items-center justify-center overflow-hidden">
                    <div
                      className="w-4/5 h-4/5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      style={{ filter: 'hue-rotate(150deg)' }}
                      dangerouslySetInnerHTML={{ __html: svgHorizontalLight }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-white/[0.05] pt-2">
                <span>Always use official vector assets from the Brand Kit</span>
                <span>{state.domain}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE C: DEVELOPER HANDOFF & FAVICON SUITE
         ===================================================================== */}
      {activeModule === 'dev-handoff' && (
        <div className="bg-[#0D131F] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-5">
          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setDevTab('react')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  devTab === 'react'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                React &lt;BrandLogo /&gt; (.tsx)
              </button>
              <button
                onClick={() => setDevTab('tokens')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  devTab === 'tokens'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                CSS & Tailwind Tokens (.css)
              </button>
              <button
                onClick={() => setDevTab('seo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  devTab === 'seo'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                SEO & JSON-LD (.html)
              </button>
              <button
                onClick={() => setDevTab('favicons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  devTab === 'favicons'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                Favicon & Manifest Suite (.zip)
              </button>
            </div>

            {devTab === 'react' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(reactCode, 'react-code')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'react-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'react-code' ? 'Copied!' : 'Copy BrandLogo.tsx'}
                </button>
                <button
                  onClick={() => handleDownloadCodeFile(reactCode, 'BrandLogo.tsx')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .tsx
                </button>
              </div>
            )}

            {devTab === 'tokens' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(tokensCode, 'tokens-code')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'tokens-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'tokens-code' ? 'Copied!' : 'Copy tokens.css'}
                </button>
                <button
                  onClick={() => handleDownloadCodeFile(tokensCode, 'tokens.css', 'text/css')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .css
                </button>
              </div>
            )}

            {devTab === 'seo' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(seoCode, 'seo-code')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'seo-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'seo-code' ? 'Copied!' : 'Copy head-seo.html'}
                </button>
                <button
                  onClick={() => handleDownloadCodeFile(seoCode, 'head-seo.html', 'text/html')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .html
                </button>
              </div>
            )}
          </div>

          {devTab === 'react' && (
            <pre className="bg-[#070A10] border border-white/[0.07] rounded-xl p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[480px] leading-relaxed">
              <code>{reactCode}</code>
            </pre>
          )}

          {devTab === 'tokens' && (
            <pre className="bg-[#070A10] border border-white/[0.07] rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[480px] leading-relaxed">
              <code>{tokensCode}</code>
            </pre>
          )}

          {devTab === 'seo' && (
            <pre className="bg-[#070A10] border border-white/[0.07] rounded-xl p-4 text-xs font-mono text-sky-300 overflow-x-auto max-h-[480px] leading-relaxed">
              <code>{seoCode}</code>
            </pre>
          )}

          {devTab === 'favicons' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#080C14] border border-white/[0.07] rounded-xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Production Favicon, Apple Touch & Web App Manifest Package
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Includes <code className="text-slate-200">favicon.svg</code>,{' '}
                    <code className="text-slate-200">16×16</code>,{' '}
                    <code className="text-slate-200">32×32</code>,{' '}
                    <code className="text-slate-200">48×48</code>,{' '}
                    <code className="text-slate-200">apple-touch-icon.png (180×180)</code>,{' '}
                    <code className="text-slate-200">192×192</code>,{' '}
                    <code className="text-slate-200">512×512</code>,{' '}
                    <code className="text-slate-200">site.webmanifest</code>, and{' '}
                    <code className="text-slate-200">browserconfig.xml</code>.
                  </p>
                </div>
                <button
                  onClick={handleDownloadFavicons}
                  disabled={exportingFavicons}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  <FileCode2 className="w-4 h-4" />
                  {exportingFavicons
                    ? 'Packaging Favicons...'
                    : 'Download Favicon & Manifest Suite (.zip)'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: '16×16 Tab', px: 16, previewSize: 24 },
                  { label: '32×32 Retina', px: 32, previewSize: 36 },
                  { label: '48×48 Desktop', px: 48, previewSize: 48 },
                  { label: '180×180 iOS', px: 180, previewSize: 64 },
                  { label: '192×192 PWA', px: 192, previewSize: 72 },
                  { label: '512×512 Store', px: 512, previewSize: 84 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#080C14] border border-white/[0.07] rounded-xl p-4 flex flex-col items-center justify-between gap-3"
                  >
                    <div className="h-24 flex items-center justify-center">
                      <div
                        style={{ width: item.previewSize, height: item.previewSize }}
                        className="rounded-lg bg-white p-1 shadow flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: emblemSvg }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.px}×{item.px}px</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
