import React from 'react';
import { LogoState } from '../../types/logo';
import { buildEmblemSvgMarkup } from '../../utils/svgBuilder';
import { drawLogoOnCanvas, loadSvgToImage } from '../../utils/canvasRenderer';
import { getExtendedSemanticIconsForDomain } from '../../data/domainSemanticIcons';

interface Variants10BoardProps {
  state: LogoState;
  onSelectVariant: (index: number) => void;
}

export const Variants10Board: React.FC<Variants10BoardProps> = ({
  state,
  onSelectVariant,
}) => {
  const canvasRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);

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
    <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
            10 BESPOKE AGENCY CONCEPTS
          </span>
          <span className="text-xs font-bold text-white">for {state.domain}</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            · {semanticPool.allSemantic.length} Semantic Symbols ({semanticPool.allSemantic.length * 10} Architecture Pairs)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {state.variants10.map((v, idx) => {
          const isActive = idx === state.activeVariantIndex;
          const isCoreIcon = coreSet.has(v.activeIcon);

          return (
            <div
              key={`${v.id}-${idx}`}
              onClick={() => onSelectVariant(idx)}
              className={`rounded-xl p-2 border transition cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'bg-indigo-950/80 border-amber-400 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400'
                  : 'bg-[#06080f] hover:bg-[#12192b] border-[#1b2333] hover:border-indigo-500/50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1.5 px-0.5 gap-1">
                <span
                  className={`font-bold truncate flex items-center gap-1 ${
                    isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  <span>#{v.id} · {v.activeIcon}</span>
                  {isCoreIcon && (
                    <span className="text-[7px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      CORE
                    </span>
                  )}
                </span>
                <span
                  className="text-[9px] text-slate-400 font-mono truncate max-w-[92px] text-right"
                  title={v.construction ? v.construction.label : v.containerStyle}
                >
                  {v.construction ? v.construction.label : v.containerStyle.slice(0, 7)}
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
                <span className="text-[9px] text-slate-400 truncate max-w-[80px]">
                  {v.fontFamily}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.primary }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.secondary }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
