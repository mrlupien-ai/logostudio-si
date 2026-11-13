import React from 'react';
import { RefreshCw, Archive, Sparkles } from 'lucide-react';
import { LogoState } from '../../types/logo';
import { buildEmblemSvgMarkup } from '../../utils/svgBuilder';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import { getExtendedSemanticIconsForDomain } from '../../data/domainSemanticIcons';
import { downloadAll10VariantsZip } from '../../utils/exporter';

interface Variants10BoardProps {
  state: LogoState;
  onSelectVariant: (index: number) => void;
  remixMode?: 'core-focus' | 'deep-semantic';
  onChangeRemixMode?: (mode: 'core-focus' | 'deep-semantic') => void;
  onRemixVariants?: () => void;
}

export const Variants10Board: React.FC<Variants10BoardProps> = ({
  state,
  onSelectVariant,
  remixMode = 'core-focus',
  onChangeRemixMode,
  onRemixVariants,
}) => {
  const canvasRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);
  const [isExportingZip, setIsExportingZip] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState('');

  const semanticPool = React.useMemo(() => {
    return getExtendedSemanticIconsForDomain(
      state.domain,
      state.word1,
      state.word2,
      state.nicheLabel,
      state.icons10,
      state.iconGroups
    );
  }, [state.domain, state.word1, state.word2, state.nicheLabel, state.icons10, state.iconGroups]);

  const coreSet = React.useMemo(() => new Set(semanticPool.core), [semanticPool.core]);

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadAll10VariantsZip(state, (msg) => setExportStatus(msg));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
      setExportStatus('');
    }
  };

  // Render miniature canvases for each variant
  React.useEffect(() => {
    state.variants10.forEach((variant, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;

      const emblemSvg = buildEmblemSvgMarkup(
        {
          containerStyle: variant.containerStyle,
          construction: variant.construction,
          activeIcon: variant.activeIcon,
          customSvgPath: variant.customSvgPath || state.customSvgPath,
          primary: variant.primary,
          secondary: variant.secondary,
          accent: variant.accent,
          fontFamily: variant.fontFamily,
          word1: variant.word1,
        },
        160
      );

      loadSvgToImage(emblemSvg)
        .then((img) => {
          drawLogoOnCanvas(canvas, img, variant, 320, 192, false, false);
        })
        .catch((err) => {
          console.error('Failed to render variant thumbnail:', err);
        });
    });
  }, [state.variants10, state.word1, state.word2, state.ext, state.keepExt, state.customSvgPath]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Drawer Header */}
      <div className="p-3 border-b border-white/[0.07] shrink-0 space-y-2.5 bg-[#090C13]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              10 Bespoke Agency Concepts
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              for <strong className="text-white font-mono">{state.domain}</strong> · {semanticPool.allSemantic.length} Semantic Symbols
            </p>
          </div>
        </div>

        {/* Pool Switcher: Core 10 vs Deep Semantic */}
        {onChangeRemixMode && (
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#06080D] border border-white/[0.07] text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => onChangeRemixMode('core-focus')}
              className={`py-1 rounded-md transition cursor-pointer ${
                remixMode === 'core-focus'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Core 10 ({semanticPool.tier1.length})
            </button>
            <button
              type="button"
              onClick={() => onChangeRemixMode('deep-semantic')}
              className={`py-1 rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
                remixMode === 'deep-semantic'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Deep Semantic ({semanticPool.allSemantic.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Vertical List of 10 Concept Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {state.variants10.map((v, idx) => {
          const isActive = idx === state.activeVariantIndex;
          const isCoreIcon = coreSet.has(v.activeIcon);

          return (
            <div
              key={`${v.id}-${idx}`}
              onClick={() => onSelectVariant(idx)}
              className={`w-full text-left rounded-xl p-2 border transition cursor-pointer group ${
                isActive
                  ? 'bg-indigo-950/60 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                  : 'bg-[#06080D] hover:bg-[#101522] border-white/[0.07] hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1.5 px-0.5 gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    className={`font-mono font-bold truncate ${
                      isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    #{v.id} · {v.activeIcon}
                  </span>
                  {isCoreIcon && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold shrink-0">
                      CORE
                    </span>
                  )}
                </div>
                <span
                  className="text-[9px] text-slate-400 font-mono truncate max-w-[92px] text-right"
                  title={v.construction ? v.construction.label : v.containerStyle}
                >
                  {v.construction ? v.construction.label : v.containerStyle}
                </span>
              </div>

              <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800/20 shadow-inner">
                <canvas
                  ref={(el) => {
                    canvasRefs.current[idx] = el;
                  }}
                  width={320}
                  height={192}
                  className="w-full h-auto"
                />
              </div>

              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[9px] text-slate-400 font-medium truncate max-w-[130px]">
                  {v.fontFamily}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: v.primary }} />
                  <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: v.secondary }} />
                  <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: v.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Footer: Remix & Export All 10 */}
      <div className="p-2.5 border-t border-white/[0.07] bg-[#06080D]/90 shrink-0 grid grid-cols-2 gap-1.5">
        {onRemixVariants && (
          <button
            type="button"
            onClick={onRemixVariants}
            className="py-1.5 px-2 rounded-lg bg-[#101522] hover:bg-white/[0.06] border border-white/[0.07] text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition cursor-pointer"
            title="Remix icon-to-architecture pairings, typography contrast, and palettes"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Remix Architectures ↻</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleExportZip}
          disabled={isExportingZip || state.variants10.length === 0}
          className="py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
          title="Export all 10 concepts as SVGs and PNGs in a .ZIP file"
        >
          <Archive className="w-3 h-3" />
          <span>{isExportingZip ? (exportStatus || 'Exporting...') : 'Export 10 (.ZIP)'}</span>
        </button>
      </div>
    </div>
  );
};
