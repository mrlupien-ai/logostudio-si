import React from 'react';
import { Type, Sparkles } from 'lucide-react';
import { LogoState, TypoContrastStyle } from '../../types/logo';
import { BRAND_FONTS } from '../../data/domains';

interface TypographyInspectorProps {
  state: LogoState;
  onChange: (patch: Partial<LogoState>) => void;
}

export const TypographyInspector: React.FC<TypographyInspectorProps> = ({ state, onChange }) => {
  return (
    <div className="space-y-3.5">
      {/* Header and TLD Toggle */}
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Wordmark &amp; Hierarchy</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={state.keepExt}
            onChange={(e) => onChange({ keepExt: e.target.checked })}
            className="rounded bg-slate-800 border-slate-700 text-indigo-500 cursor-pointer"
          />
          <span className="text-[11px]">Show .TLD</span>
        </label>
      </div>

      {/* Wordmark text inputs */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Word 1</span>
          <input
            type="text"
            value={state.word1}
            onChange={(e) => onChange({ word1: e.target.value })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Word 2 (Optional)</span>
          <input
            type="text"
            value={state.word2}
            placeholder="(Single word)"
            onChange={(e) => onChange({ word2: e.target.value })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-white font-bold placeholder:text-slate-600 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Extension</span>
          <input
            type="text"
            value={state.ext}
            onChange={(e) => onChange({ ext: e.target.value })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tagline / Subtitle feature */}
      <div className="pt-1 border-t border-[#1a2233]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-slate-400">Brand Tagline / Slogan</span>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={state.showTagline}
              onChange={(e) => onChange({ showTagline: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 cursor-pointer"
            />
            <span>Enable Slogan</span>
          </label>
        </div>
        {state.showTagline && (
          <input
            type="text"
            value={state.tagline}
            placeholder="e.g. DIGITAL ASSET PLATFORM"
            onChange={(e) => onChange({ tagline: e.target.value })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
          />
        )}
      </div>

      {/* Typographic Weight Contrast & Font Family */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[#1a2233]">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Typographic Weight Contrast
          </label>
          <select
            value={state.typoContrast}
            onChange={(e) => onChange({ typoContrast: e.target.value as TypoContrastStyle })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="bold-bold">1. Classic Authority (800 + 700)</option>
            <option value="heavy-light">2. Agency Contrast (800 Bold + 300 Light)</option>
            <option value="light-heavy">3. Modern Inverse (300 Light + 800 Bold)</option>
            <option value="upper-tracked">4. Tracked All-Caps Tech</option>
            <option value="dot-badge">5. Dot Accent Wordmark</option>
            <option value="mono-tech">6. Swiss Monospace Modernist</option>
            <option value="serif-editorial">7. Luxury Editorial Serif</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Brand Font Family
          </label>
          <select
            value={state.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-indigo-500 cursor-pointer"
          >
            {BRAND_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Letter Case transformations */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Word 1 Letter Case
          </label>
          <div className="flex bg-[#06080f] rounded-lg p-0.5 border border-[#232c42]">
            {(['as-is', 'uppercase', 'capitalize', 'lowercase'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ letterCase1: mode })}
                className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition cursor-pointer capitalize ${
                  state.letterCase1 === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'as-is' ? 'Auto' : mode.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Word 2 Letter Case
          </label>
          <div className="flex bg-[#06080f] rounded-lg p-0.5 border border-[#232c42]">
            {(['as-is', 'uppercase', 'capitalize', 'lowercase'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ letterCase2: mode })}
                className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition cursor-pointer capitalize ${
                  state.letterCase2 === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'as-is' ? 'Auto' : mode.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
