import React from 'react';
import { Type } from 'lucide-react';
import { LogoState, TypoContrastStyle } from '../../types/logo';
import { BRAND_FONTS } from '../../data/domains';

interface TypographyInspectorProps {
  state: LogoState;
  onChange: (patch: Partial<LogoState>) => void;
}

export const TypographyInspector: React.FC<TypographyInspectorProps> = ({
  state,
  onChange,
}) => {
  return (
    <div className="divide-y divide-white/[0.07]">
      {/* SECTION 1: WORDMARK & HIERARCHY */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              Wordmark &amp; Hierarchy
            </span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={state.keepExt}
              onChange={(e) => onChange({ keepExt: e.target.checked })}
              className="rounded border-slate-600 bg-[#06080D] text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Show .TLD</span>
          </label>
        </div>

        {/* Word 1, Word 2, Extension Inputs */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Word 1</label>
            <input
              type="text"
              value={state.word1}
              onChange={(e) => onChange({ word1: e.target.value })}
              className="w-full bg-[#06080D] border border-white/[0.07] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
            />
          </div>
          <div className="col-span-5">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Word 2 (Optional)
            </label>
            <input
              type="text"
              value={state.word2}
              onChange={(e) => onChange({ word2: e.target.value })}
              placeholder="None"
              className="w-full bg-[#06080D] border border-white/[0.07] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Extension</label>
            <input
              type="text"
              value={state.ext}
              onChange={(e) => onChange({ ext: e.target.value })}
              className="w-full bg-[#06080D] border border-white/[0.07] focus:border-amber-500 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Brand Tagline / Slogan */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400">Brand Tagline / Slogan</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={state.showTagline}
                onChange={(e) => onChange({ showTagline: e.target.checked })}
                className="rounded border-slate-600 bg-[#06080D] text-indigo-500 focus:ring-0 w-3 h-3 cursor-pointer"
              />
              <span>Enable Slogan</span>
            </label>
          </div>
          {state.showTagline && (
            <input
              type="text"
              value={state.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="ENTER BRAND TAGLINE..."
              className="w-full bg-[#06080D] border border-white/[0.07] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-200 focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* SECTION 2: TYPOGRAPHY & CASE MATRIX */}
      <div className="p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Typographic Weight Contrast
            </label>
            <select
              value={state.typoContrast}
              onChange={(e) => onChange({ typoContrast: e.target.value as TypoContrastStyle })}
              className="w-full bg-[#06080D] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="bold-bold">1. Classic Authority (800 + 700)</option>
              <option value="heavy-light">2. Agency Editorial (900 + 300)</option>
              <option value="light-heavy">3. Modern Tech (300 + 800)</option>
              <option value="upper-tracked">4. Wide Tracked All-Caps</option>
              <option value="dot-badge">5. Monoline + TLD Pill Badge</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Brand Font Family
            </label>
            <select
              value={state.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="w-full bg-[#06080D] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {BRAND_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Letter Case Controls (Word 1 & Word 2) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Word 1 Letter Case
            </label>
            <div className="grid grid-cols-4 gap-1 bg-[#06080D] p-0.5 rounded-lg border border-white/[0.07] text-[10px] font-bold">
              {(
                [
                  { id: 'as-is', label: 'Auto' },
                  { id: 'uppercase', label: 'Upp' },
                  { id: 'capitalize', label: 'Cap' },
                  { id: 'lowercase', label: 'Low' },
                ] as { id: LogoState['letterCase1']; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ letterCase1: item.id })}
                  className={`py-1 rounded transition cursor-pointer ${
                    state.letterCase1 === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Word 2 Letter Case
            </label>
            <div className="grid grid-cols-4 gap-1 bg-[#06080D] p-0.5 rounded-lg border border-white/[0.07] text-[10px] font-bold">
              {(
                [
                  { id: 'as-is', label: 'Auto' },
                  { id: 'uppercase', label: 'Upp' },
                  { id: 'capitalize', label: 'Cap' },
                  { id: 'lowercase', label: 'Low' },
                ] as { id: LogoState['letterCase2']; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ letterCase2: item.id })}
                  className={`py-1 rounded transition cursor-pointer ${
                    state.letterCase2 === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
