import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import { LogoState, CanvasBackgroundMode } from '../../types/logo';
import { COLOR_PALETTES } from '../../data/domains';

interface PaletteInspectorProps {
  state: LogoState;
  onChange: (patch: Partial<LogoState>) => void;
  onCyclePalette: () => void;
}

export const PaletteInspector: React.FC<PaletteInspectorProps> = ({
  state,
  onChange,
  onCyclePalette,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>Curated Color Palette</span>
        </label>
        <button
          type="button"
          onClick={onCyclePalette}
          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>Next Palette ↻</span>
        </button>
      </div>

      {/* Preset Palettes Quick Dropdown */}
      <div>
        <select
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            if (!isNaN(idx) && COLOR_PALETTES[idx]) {
              const pal = COLOR_PALETTES[idx];
              onChange({
                primary: pal.primary,
                secondary: pal.secondary,
                accent: pal.accent,
              });
            }
          }}
          className="w-full bg-[#06080f] border border-[#232c42] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">Select Curated Palette ({COLOR_PALETTES.length} presets)...</option>
          {COLOR_PALETTES.map((pal, idx) => (
            <option key={pal.name} value={idx}>
              {pal.name} ({pal.primary} · {pal.secondary})
            </option>
          ))}
        </select>
      </div>

      {/* 3 Main Ink Colors */}
      <div className="grid grid-cols-3 gap-2">
        {/* Primary Ink */}
        <div className="bg-[#06080f] border border-[#232c42] rounded-xl p-2 flex items-center gap-2">
          <input
            type="color"
            value={state.primary}
            onChange={(e) => onChange({ primary: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
          />
          <div className="overflow-hidden">
            <div className="text-[9px] text-slate-400">Primary Ink</div>
            <div className="text-[11px] font-mono text-white font-bold uppercase truncate">
              {state.primary}
            </div>
          </div>
        </div>

        {/* Secondary Brand Accent */}
        <div className="bg-[#06080f] border border-[#232c42] rounded-xl p-2 flex items-center gap-2">
          <input
            type="color"
            value={state.secondary}
            onChange={(e) => onChange({ secondary: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
          />
          <div className="overflow-hidden">
            <div className="text-[9px] text-slate-400">Brand Accent</div>
            <div className="text-[11px] font-mono text-white font-bold uppercase truncate">
              {state.secondary}
            </div>
          </div>
        </div>

        {/* Spark Point */}
        <div className="bg-[#06080f] border border-[#232c42] rounded-xl p-2 flex items-center gap-2">
          <input
            type="color"
            value={state.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
          />
          <div className="overflow-hidden">
            <div className="text-[9px] text-slate-400">Spark Point</div>
            <div className="text-[11px] font-mono text-white font-bold uppercase truncate">
              {state.accent}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Background Mode */}
      <div className="pt-1 border-t border-[#1a2233]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400">Canvas Surface Context</span>
          <span className="text-[9px] text-slate-500">Affects preview &amp; exports</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { mode: 'white', label: 'White' },
              { mode: 'dark', label: 'Dark' },
              { mode: 'transparent', label: 'Transparent' },
              { mode: 'brand', label: 'Brand Tint' },
            ] as const
          ).map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ bgMode: mode })}
              className={`py-1.5 text-[10px] font-semibold rounded-lg border transition cursor-pointer text-center ${
                state.bgMode === mode
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                  : 'bg-[#06080f] text-slate-400 border-[#232c42] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
