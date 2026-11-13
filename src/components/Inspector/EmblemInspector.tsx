import React, { useMemo } from 'react';
import {
  Hexagon,
  Upload,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Search,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import {
  LogoState,
  EmblemContainerStyle,
  MainLayoutMode,
  ConstructionFamily,
  EmblemFusionMode,
} from '../../types/logo';
import { resolveLucideIcon } from '../../utils/svgBuilder';
import {
  ALL_CONSTRUCTION_FAMILIES,
  FAMILY_HUMAN_NAMES,
  familyToLegacyContainerStyle,
  hashDomain,
  instantiateFamily,
  validateConstructionSpec,
} from '../../utils/constructionEngine';

interface EmblemInspectorProps {
  state: LogoState;
  onChange: (partial: Partial<LogoState>) => void;
  onOpenVault: () => void;
}

const FUSION_OPTIONS: { value: EmblemFusionMode; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'monogram-negative', label: 'Monogram + Symbol' },
  { value: 'dual-badge', label: 'Dual Badge' },
];

export const EmblemInspector: React.FC<EmblemInspectorProps> = ({
  state,
  onChange,
  onOpenVault,
}) => {
  const familyOptions = useMemo(() => {
    const baseSeed = hashDomain(state.domain || 'logo');
    return ALL_CONSTRUCTION_FAMILIES.map((family, idx) => {
      const slotSeed = (baseSeed ^ Math.imul(idx + 1, 0x85ebca6b)) >>> 0 || 1;
      let spec = instantiateFamily(family, slotSeed, 0);
      for (let attempt = 0; attempt < 5; attempt++) {
        const cand = instantiateFamily(family, slotSeed, attempt);
        if (validateConstructionSpec(cand).valid) {
          spec = cand;
          break;
        }
      }
      return {
        family,
        label: `${idx + 1}. ${FAMILY_HUMAN_NAMES[family]}`,
        spec,
      };
    });
  }, [state.domain]);

  const activeFamily: ConstructionFamily = state.construction?.family || 'notchTab';

  const handleFamilySelect = (family: ConstructionFamily) => {
    const found = familyOptions.find((f) => f.family === family);
    const nextSpec =
      found?.spec || instantiateFamily(family, hashDomain(state.domain || 'logo'), 0);
    const legacyContainer: EmblemContainerStyle = familyToLegacyContainerStyle(family);
    onChange({
      construction: nextSpec,
      containerStyle: legacyContainer,
    });
  };

  const handleCustomSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const pathMatches = content.match(/<path[^>]*d=["']([^"']+)["']/gi);
      if (pathMatches && pathMatches.length > 0) {
        const combinedD = pathMatches
          .map((m) => {
            const dMatch = m.match(/d=["']([^"']+)["']/i);
            return dMatch ? dMatch[1] : '';
          })
          .filter(Boolean)
          .join(' ');
        if (combinedD) {
          onChange({ customSvgPath: combinedD });
        }
      }
    };
    reader.readAsText(file);
  };

  const renderIconButton = (
    iconName: string,
    idx: number,
    badge?: 'CORE' | 'W1' | 'W2'
  ) => {
    const IconComp = resolveLucideIcon(iconName);
    const isSelected = state.activeIcon === iconName && !state.customSvgPath;
    return (
      <button
        key={`${iconName}-${idx}`}
        type="button"
        onClick={() => onChange({ activeIcon: iconName, customSvgPath: undefined })}
        title={`${iconName}${badge ? ` (${badge})` : ''}`}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition cursor-pointer ${
          isSelected
            ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
            : 'bg-[#07090E] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
        }`}
      >
        <IconComp className="w-4 h-4 mb-0.5" />
        <span className="text-[8px] truncate w-full text-center leading-tight">
          {iconName}
        </span>
      </button>
    );
  };

  const groups = state.iconGroups;
  const fusion = state.emblemFusion || 'single';

  return (
    <div className="p-3.5 border-b border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Hexagon className="w-3.5 h-3.5 text-emerald-400" />
          Vector Emblem Architecture
        </span>
        <button
          type="button"
          onClick={onOpenVault}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
        >
          <Search className="w-3 h-3" />
          Change Symbol ({state.activeIcon})
        </button>
      </div>

      {/* 3-Mode Compound Emblem Fusion Selector */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-slate-500 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            Emblem Fusion Mode
          </label>
          <span className="text-[9px] font-mono text-emerald-400 uppercase">{fusion}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-[#07090E] p-1 rounded-lg border border-white/[0.06]">
          {FUSION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ emblemFusion: opt.value })}
              className={`py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                fusion === opt.value
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Icon Picker when Dual Badge is active */}
      {fusion === 'dual-badge' && (
        <div className="bg-[#07090E] border border-indigo-500/30 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-300">
              Secondary Interlock Symbol
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {state.secondaryIcon || 'Sparkles'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {state.icons10.slice(0, 10).map((ico, idx) => {
              const IconComp = resolveLucideIcon(ico);
              const isSec = (state.secondaryIcon || state.icons10[1] || 'Sparkles') === ico;
              return (
                <button
                  key={`sec-${ico}-${idx}`}
                  type="button"
                  onClick={() => onChange({ secondaryIcon: ico })}
                  title={`Secondary Symbol: ${ico}`}
                  className={`p-1.5 rounded border flex flex-col items-center justify-center transition cursor-pointer ${
                    isSec
                      ? 'bg-emerald-500/25 border-emerald-400 text-white'
                      : 'bg-[#0B0F17] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="text-[7px] truncate w-full text-center mt-0.5">{ico}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Construction Family & Master Lockup Layout (Full-width rows so labels never clip) */}
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">
            Construction Style (36 Geometric Silhouettes)
          </label>
          <select
            value={activeFamily}
            onChange={(e) => handleFamilySelect(e.target.value as ConstructionFamily)}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {familyOptions.map((opt) => (
              <option key={opt.family} value={opt.family} className="bg-[#0D1017]">
                {opt.label} — {opt.spec.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Master Lockup Layout</label>
          <select
            value={state.mainLayout}
            onChange={(e) => onChange({ mainLayout: e.target.value as MainLayoutMode })}
            className="w-full bg-[#07090E] border border-white/[0.08] rounded-md px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="horizontal" className="bg-[#0D1017]">
              Horizontal (Icon Left + Wordmark Right)
            </option>
            <option value="stacked" className="bg-[#0D1017]">
              Stacked (Centered Emblem Top)
            </option>
          </select>
        </div>
      </div>

      {/* Stroke Width & Rotation */}
      <div className="space-y-2.5 pt-1">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-400">Icon Stroke Width (px)</span>
            <span className="text-indigo-400 font-mono">{state.iconStrokeWidth} px</span>
          </div>
          <input
            type="range"
            min="1.2"
            max="3.0"
            step="0.1"
            value={state.iconStrokeWidth}
            onChange={(e) => onChange({ iconStrokeWidth: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="text-slate-400">Icon Rotation (°)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono">{state.iconRotation}°</span>
              {[0, -15, 45, 90].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onChange({ iconRotation: deg })}
                  className="px-1 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-[9px] text-slate-400 cursor-pointer"
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={state.iconRotation}
              onChange={(e) => onChange({ iconRotation: parseInt(e.target.value, 10) })}
              className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onChange({ iconRotation: 0, iconFlipH: false, iconFlipV: false })}
              title="Reset Transform"
              className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Flip & Custom SVG Upload */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ iconFlipH: !state.iconFlipH })}
            className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 transition cursor-pointer ${
              state.iconFlipH
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-[#07090E] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3 h-3" />
            Flip H
          </button>
          <button
            type="button"
            onClick={() => onChange({ iconFlipV: !state.iconFlipV })}
            className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 transition cursor-pointer ${
              state.iconFlipV
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-[#07090E] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            <FlipVertical className="w-3 h-3" />
            Flip V
          </button>
        </div>

        <label className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer transition">
          <Upload className="w-3 h-3 text-indigo-400" />
          Import Custom SVG
          <input
            type="file"
            accept=".svg"
            onChange={handleCustomSvgUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Curated 10 Symbols (Grouped 4 Core + 3 Word1 + 3 Word2) */}
      <div className="pt-1 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-500">
            10 Symbols for <span className="text-slate-300 font-semibold">{state.domain}</span>
          </label>
          <span className="text-[9px] text-indigo-400 font-medium">Click to apply</span>
        </div>

        {groups ? (
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Concept ({state.domain.split('.')[0]})
                </span>
                <span className="text-[8px] text-slate-500">4 core symbols</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {groups.core.map((ico, idx) => renderIconButton(ico, idx, 'CORE'))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-indigo-300 flex items-center gap-1 truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    {groups.word1.label}
                  </span>
                  <span className="text-[8px] text-slate-500">3</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {groups.word1.icons.map((ico, idx) => renderIconButton(ico, idx + 4, 'W1'))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-emerald-300 flex items-center gap-1 truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    {groups.word2.label}
                  </span>
                  <span className="text-[8px] text-slate-500">3</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {groups.word2.icons.map((ico, idx) => renderIconButton(ico, idx + 7, 'W2'))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1.5">
            {state.icons10.slice(0, 10).map((iconName, idx) =>
              renderIconButton(iconName, idx)
            )}
          </div>
        )}
      </div>
    </div>
  );
};
