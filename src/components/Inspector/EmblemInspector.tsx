import React from 'react';
import { Shield, RotateCw, FlipHorizontal, FlipVertical, Upload, Trash2 } from 'lucide-react';
import { LogoState, EmblemContainerStyle, MainLayoutMode } from '../../types/logo';
import { constructionsForDomain, familyToLegacyContainerStyle } from '../../utils/constructionEngine';

interface EmblemInspectorProps {
  state: LogoState;
  onChange: (patch: Partial<LogoState>) => void;
  onOpenVault: () => void;
}

export const EmblemInspector: React.FC<EmblemInspectorProps> = ({
  state,
  onChange,
  onOpenVault,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const all36Constructions = React.useMemo(() => {
    return constructionsForDomain(state.domain, 0, 36);
  }, [state.domain]);

  const domainConstructions = React.useMemo(() => {
    const fromVariants = state.variants10
      .map((v) => v.construction)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (fromVariants.length === 10) {
      return fromVariants;
    }
    return all36Constructions.slice(0, 10);
  }, [state.variants10, all36Constructions]);

  const extraSilhouetteConstructions = React.useMemo(() => {
    const activeIds = new Set(domainConstructions.map((c) => c.id));
    return all36Constructions.filter((c) => !activeIds.has(c.id));
  }, [domainConstructions, all36Constructions]);

  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const pathMatch = text.match(/<path[^>]*d="([^"]+)"/i);
      if (pathMatch && pathMatch[1]) {
        onChange({ customSvgPath: pathMatch[1] });
      } else {
        const allPaths = Array.from(text.matchAll(/d="([^"]+)"/g)).map((m) => m[1]);
        if (allPaths.length > 0) {
          onChange({ customSvgPath: allPaths.join(' ') });
        }
      }
    };
    reader.readAsText(file);
  };

  const currentSelectValue = state.construction
    ? `domain:${state.construction.id}`
    : state.containerStyle;

  const handleConstructionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith('domain:')) {
      const specId = val.slice('domain:'.length);
      const found =
        domainConstructions.find((c) => c.id === specId) ||
        all36Constructions.find((c) => c.id === specId);
      if (found) {
        onChange({
          construction: found,
          containerStyle: familyToLegacyContainerStyle(found.family),
        });
      }
    } else {
      onChange({
        construction: undefined,
        containerStyle: val as EmblemContainerStyle,
      });
    }
  };

  return (
    <div className="p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            Vector Emblem Architecture
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenVault}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
        >
          Change Symbol ({state.activeIcon})
        </button>
      </div>

      {/* Construction Style & Master Lockup Layout */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Construction Style
          </label>
          <select
            value={currentSelectValue}
            onChange={handleConstructionChange}
            className="w-full bg-[#06080D] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <optgroup label="This Domain (10)">
              {domainConstructions.map((spec, idx) => (
                <option key={spec.id} value={`domain:${spec.id}`}>
                  {idx + 1}. {spec.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Extended Non-Box Silhouettes (26)">
              {extraSilhouetteConstructions.map((spec, idx) => (
                <option key={spec.id} value={`domain:${spec.id}`}>
                  {idx + 11}. {spec.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Classic (12)">
              <option value="cutoutCorner">1. Negative Space Cutout</option>
              <option value="monogramSeal">2. Monogram Initial + Seal</option>
              <option value="isoHexCube">3. Isometric 3D Hexagon</option>
              <option value="bauhausGrid">4. Bauhaus 4-Quadrant Grid</option>
              <option value="offsetNeo">5. Neo-Brutalist Offset</option>
              <option value="swissSeal">6. Swiss Precision Orbital</option>
              <option value="slashCapsule">7. Diagonal 15° Duotone Split</option>
              <option value="shieldCrest">8. Keystone Architectural Crest</option>
              <option value="vennPortal">9. Overlapping Dual-Lens Portal</option>
              <option value="squircle">10. Apple Continuous Squircle</option>
              <option value="minimalistSpark">11. Pure Oversized Vector Spark</option>
              <option value="pureIcon">12. Standalone Pure Icon</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Master Lockup Layout
          </label>
          <select
            value={state.mainLayout}
            onChange={(e) => onChange({ mainLayout: e.target.value as MainLayoutMode })}
            className="w-full bg-[#06080D] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="horizontal">Horizontal (Icon Left)</option>
            <option value="stacked">Centered Stacked (Icon Top)</option>
          </select>
        </div>
      </div>

      {/* Sliders: Stroke Width & Rotation */}
      <div className="space-y-2.5 pt-1">
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-semibold text-slate-400">Icon Stroke Width (px)</span>
            <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.2 rounded">
              {state.iconStrokeWidth.toFixed(1)} px
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="3.5"
            step="0.1"
            value={state.iconStrokeWidth}
            onChange={(e) => onChange({ iconStrokeWidth: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-semibold text-slate-400">Icon Rotation (°)</span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                {state.iconRotation}°
              </span>
              {[0, -15, 45, 90].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onChange({ iconRotation: deg < 0 ? 360 + deg : deg })}
                  className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={state.iconRotation}
              onChange={(e) => onChange({ iconRotation: parseInt(e.target.value, 10) })}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => onChange({ iconRotation: (state.iconRotation + 90) % 360 })}
              className="p-1 rounded bg-[#06080D] hover:bg-slate-800 text-slate-300 border border-white/[0.07] transition cursor-pointer"
              title="Rotate +90 degrees"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Flip Horizontal / Vertical & Custom SVG */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ iconFlipH: !state.iconFlipH })}
            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border flex items-center gap-1 transition cursor-pointer ${
              state.iconFlipH
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-[#06080D] text-slate-400 border-white/[0.07] hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3 h-3" />
            <span>Flip H</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ iconFlipV: !state.iconFlipV })}
            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border flex items-center gap-1 transition cursor-pointer ${
              state.iconFlipV
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-[#06080D] text-slate-400 border-white/[0.07] hover:text-white'
            }`}
          >
            <FlipVertical className="w-3 h-3" />
            <span>Flip V</span>
          </button>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            onChange={handleSvgFileUpload}
            className="hidden"
          />
          {state.customSvgPath ? (
            <button
              type="button"
              onClick={() => onChange({ customSvgPath: undefined })}
              className="px-2 py-1 text-[10px] font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset SVG</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-[10px] font-semibold text-slate-300 bg-[#06080D] hover:bg-slate-800 border border-white/[0.07] rounded-lg flex items-center gap-1 transition cursor-pointer"
              title="Upload your own custom vector SVG icon"
            >
              <Upload className="w-3 h-3 text-indigo-400" />
              <span>Import Custom SVG</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
