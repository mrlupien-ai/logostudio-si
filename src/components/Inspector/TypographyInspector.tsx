import React, { useMemo, useState } from 'react';
import { Type, Sparkles, RotateCcw } from 'lucide-react';
import { ExtStyle, LogoState, TypoContrastStyle, WordmarkAccentMode } from '../../types/logo';
import { BRAND_FONTS } from '../../data/domains';
import { evaluateDomainBrandability } from '../../utils/siBrandIntelligence';

interface TypographyInspectorProps {
  state: LogoState;
  onChange: (partial: Partial<LogoState>) => void;
}

const CONTRAST_OPTIONS: { value: TypoContrastStyle; label: string }[] = [
  { value: 'bold-bold', label: '1. Classic Authority (800 + 700)' },
  { value: 'heavy-light', label: '2. Editorial Contrast (800 + 300)' },
  { value: 'light-heavy', label: '3. Modern Flip (300 + 800)' },
  { value: 'upper-tracked', label: '4. Tracked Monolith (CAPS)' },
  { value: 'dot-badge', label: '5. Monoline + TLD Pill' },
  { value: 'mono-tech', label: '6. Developer Terminal (Mono)' },
  { value: 'serif-editorial', label: '7. Luxury Editorial (Serif)' },
];

const EXT_STYLE_OPTIONS: { value: ExtStyle; label: string }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'superscript', label: 'Sup' },
  { value: 'pill', label: 'Pill' },
  { value: 'dot', label: 'Dot' },
  { value: 'tech-tag', label: 'Tech Tag' },
];

const WORDMARK_ACCENT_OPTIONS: { value: WordmarkAccentMode; label: string }[] = [
  { value: 'none', label: 'Standard' },
  { value: 'spark-dot', label: 'Spark Dot' },
  { value: 'stencil-slice-45', label: '45° Stencil' },
];

export const TypographyInspector: React.FC<TypographyInspectorProps> = ({ state, onChange }) => {
  const [taglineIndex, setTaglineIndex] = useState(0);

  const brandReport = useMemo(
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

  const handleCycleSiTagline = () => {
    const list = brandReport.archetypeTaglines;
    if (!list.length) return;
    const nextIdx = (taglineIndex + 1) % list.length;
    setTaglineIndex(nextIdx);
    onChange({
      tagline: list[nextIdx].tagline,
      showTagline: true,
    });
  };

  const t1Em = state.tracking1Em ?? -0.02;
  const t2Em = state.tracking2Em ?? -0.01;

  return (
    <div className="p-3.5 border-b border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          Wordmark & Hierarchy
        </span>
        <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={state.keepExt}
            onChange={(e) => onChange({ keepExt: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
          />
          Show .TLD
        </label>
      </div>

      {/* Word 1 + Word 2 + Word 3 + Extension */}
      <div className="grid grid-cols-12 gap-1.5">
        <div className="col-span-3">
          <label className="block text-[10px] text-slate-500 mb-1">Word 1</label>
          <input
            type="text"
            value={state.word1}
            onChange={(e) => onChange({ word1: e.target.value })}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="col-span-4">
          <label className="block text-[10px] text-slate-500 mb-1">Word 2 (Opt)</label>
          <input
            type="text"
            value={state.word2}
            onChange={(e) => onChange({ word2: e.target.value })}
            placeholder="(Single)"
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1 text-xs font-semibold text-emerald-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-[10px] text-slate-500 mb-1">Word 3 (Opt)</label>
          <input
            type="text"
            value={state.word3 || ''}
            onChange={(e) => onChange({ word3: e.target.value })}
            placeholder="(None)"
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1 text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] text-slate-500 mb-1">Ext</label>
          <input
            type="text"
            value={state.ext}
            onChange={(e) => onChange({ ext: e.target.value })}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-1.5 py-1 text-xs font-mono text-amber-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 5-Mode .TLD Extension Treatment Selector */}
      {state.keepExt && (
        <div className="pt-0.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 font-medium">.TLD Extension Treatment</span>
            <span className="text-[9px] font-mono text-indigo-400 uppercase">{state.extStyle || 'pill'}</span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-[#07090E] p-1 rounded-lg border border-white/[0.06]">
            {EXT_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ extStyle: opt.value })}
                className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                  (state.extStyle || 'pill') === opt.value
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional Tagline + .SI Tagline Generator Button */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between mb-1 gap-1">
          <label className="text-[10px] text-slate-500">Brand Tagline / Slogan</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCycleSiTagline}
              title="Cycle through 5 deterministic .SI archetype taglines"
              className="px-2 py-0.5 rounded bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 hover:from-indigo-500/30 hover:to-emerald-500/30 border border-emerald-400/30 text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition"
            >
              <Sparkles className="w-2.5 h-2.5" />
              .SI Tagline
            </button>
            <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={state.showTagline}
                onChange={(e) => onChange({ showTagline: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
              />
              Enable
            </label>
          </div>
        </div>
        {state.showTagline && (
          <input
            type="text"
            value={state.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. DATA ANALYTICS & INSIGHTS"
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        )}
      </div>

      {/* Contrast Style & Font Family (stacked cleanly so no option truncates) */}
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Typographic Weight Contrast</label>
          <select
            value={state.typoContrast}
            onChange={(e) => onChange({ typoContrast: e.target.value as TypoContrastStyle })}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {CONTRAST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0D1017]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Brand Font Family (OFL Licensed)</label>
          <select
            value={state.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {BRAND_FONTS.map((f) => (
              <option key={f} value={f} className="bg-[#0D1017]">
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wordmark Accent (Standard · Spark Dot · 45° Stencil) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">Wordmark Glyph Accent</span>
          <span className="text-[9px] font-mono text-slate-400">SVG + Canvas Sync</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-[#07090E] p-1 rounded-lg border border-white/[0.06]">
          {WORDMARK_ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ wordmarkAccent: opt.value })}
              className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                (state.wordmarkAccent || 'none') === opt.value
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-Word Optical Tracking (em) */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <div className="bg-[#07090E] border border-white/[0.06] rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400 font-medium">W1 Tracking</span>
            <button
              type="button"
              onClick={() => onChange({ tracking1Em: -0.02 })}
              title="Reset Word 1 tracking to -0.020em"
              className="font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
            >
              {t1Em >= 0 ? `+${t1Em.toFixed(3)}` : t1Em.toFixed(3)}em
              <RotateCcw className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          </div>
          <input
            type="range"
            min="-0.06"
            max="0.15"
            step="0.005"
            value={t1Em}
            onChange={(e) => onChange({ tracking1Em: parseFloat(e.target.value) })}
            onDoubleClick={() => onChange({ tracking1Em: -0.02 })}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="bg-[#07090E] border border-white/[0.06] rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400 font-medium">W2 Tracking</span>
            <button
              type="button"
              onClick={() => onChange({ tracking2Em: -0.01 })}
              title="Reset Word 2 tracking to -0.010em"
              className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
            >
              {t2Em >= 0 ? `+${t2Em.toFixed(3)}` : t2Em.toFixed(3)}em
              <RotateCcw className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          </div>
          <input
            type="range"
            min="-0.06"
            max="0.15"
            step="0.005"
            value={t2Em}
            onChange={(e) => onChange({ tracking2Em: parseFloat(e.target.value) })}
            onDoubleClick={() => onChange({ tracking2Em: -0.01 })}
            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Letter Case Controls */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Word 1 Letter Case</label>
          <div className="grid grid-cols-4 gap-1 bg-[#07090E] p-0.5 rounded-md border border-white/[0.06]">
            {(['as-is', 'uppercase', 'capitalize', 'lowercase'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ letterCase1: mode })}
                className={`py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                  state.letterCase1 === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'as-is' ? 'Auto' : mode === 'uppercase' ? 'Upp' : mode === 'capitalize' ? 'Cap' : 'Low'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Word 2 Letter Case</label>
          <div className="grid grid-cols-4 gap-1 bg-[#07090E] p-0.5 rounded-md border border-white/[0.06]">
            {(['as-is', 'uppercase', 'capitalize', 'lowercase'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ letterCase2: mode })}
                className={`py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                  state.letterCase2 === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'as-is' ? 'Auto' : mode === 'uppercase' ? 'Upp' : mode === 'capitalize' ? 'Cap' : 'Low'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.word3 && state.word3.trim() !== '' && (
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Word 3 Letter Case</label>
          <div className="grid grid-cols-4 gap-1 bg-[#07090E] p-0.5 rounded-md border border-white/[0.06]">
            {(['as-is', 'uppercase', 'capitalize', 'lowercase'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ letterCase3: mode })}
                className={`py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                  (state.letterCase3 || 'as-is') === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'as-is' ? 'Auto' : mode === 'uppercase' ? 'Upp' : mode === 'capitalize' ? 'Cap' : 'Low'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
