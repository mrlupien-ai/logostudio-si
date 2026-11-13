import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { LogoState } from '../../types/logo';
import { computeLockupLayout } from '../../utils/lockupLayout';

interface OpticalSlidersProps {
  state: LogoState;
  onChange: (patch: Partial<LogoState>) => void;
  onReset: () => void;
  isClamped?: boolean;
}

export const OpticalSliders: React.FC<OpticalSlidersProps> = ({
  state,
  onChange,
  onReset,
  isClamped: propIsClamped,
}) => {
  const layout = React.useMemo(() => {
    return computeLockupLayout(null, state, 750, 450, false);
  }, [state]);

  const isClamped = propIsClamped ?? layout.isClamped;

  return (
    <div className="space-y-3 pt-2 border-t border-[#1a2233]">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Optical Proportions &amp; Spacing</span>
        </label>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
          title="Reset to optical defaults"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Spacing / Fit Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
        <button
          type="button"
          onClick={() => onChange({ masterScale: 1.0, gap: 26 })}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
            state.masterScale === 1.0
              ? 'bg-indigo-600 text-white'
              : 'bg-[#141b2d] text-slate-300 hover:text-white hover:bg-[#1e2740]'
          }`}
          title="Atom standard fit occupying 90% of the safe crop zone"
        >
          Atom Fit (90% of crop zone)
        </button>
        <button
          type="button"
          onClick={() => onChange({ masterScale: 1.08, gap: 28 })}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
            state.masterScale === 1.08
              ? 'bg-indigo-600 text-white'
              : 'bg-[#141b2d] text-slate-300 hover:text-white hover:bg-[#1e2740]'
          }`}
          title="Max impact occupying 97% of the safe crop zone"
        >
          Max Impact (97%)
        </button>
        <button
          type="button"
          onClick={() => onChange({ masterScale: 0.83, gap: 24 })}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
            state.masterScale === 0.83
              ? 'bg-indigo-600 text-white'
              : 'bg-[#141b2d] text-slate-300 hover:text-white hover:bg-[#1e2740]'
          }`}
          title="Relaxed fit occupying 75% of the safe crop zone"
        >
          Relaxed (75%)
        </button>
      </div>

      {isClamped && (
        <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
          <span>⚠️ Limited to the Atom crop zone</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Master Lockup Scale</span>
            <span className="text-white font-mono">{Math.round(state.masterScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={Math.round(state.masterScale * 100)}
            onChange={(e) => onChange({ masterScale: parseInt(e.target.value, 10) / 100 })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Emblem-to-Text Ratio</span>
            <span className="text-white font-mono">{Math.round(state.iconScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="150"
            value={Math.round(state.iconScale * 100)}
            onChange={(e) => onChange({ iconScale: parseInt(e.target.value, 10) / 100 })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Emblem-to-Text Gap</span>
            <span className="text-white font-mono">{state.gap}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="56"
            value={state.gap}
            onChange={(e) => onChange({ gap: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Letter Tracking</span>
            <span className="text-white font-mono">{state.tracking.toFixed(1)}px</span>
          </div>
          <input
            type="range"
            min="-4.0"
            max="6.0"
            step="0.5"
            value={state.tracking}
            onChange={(e) => onChange({ tracking: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
