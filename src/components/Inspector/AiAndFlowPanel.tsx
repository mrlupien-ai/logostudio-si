import React from 'react';
import {
  Bot,
  Copy,
  Check,
  Upload,
  Trash2,
} from 'lucide-react';
import { LogoState } from '../../types/logo';
import { describeConstruction } from '../../utils/constructionEngine';

interface AiAndFlowPanelProps {
  state: LogoState;
  onUpdateRaster: (dataUrl: string | null) => void;
  onClearRaster: () => void;
}

export const AiAndFlowPanel: React.FC<AiAndFlowPanelProps> = ({
  state,
  onUpdateRaster,
  onClearRaster,
}) => {
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);

  const fullWordmark = `${state.word1}${state.word2 || ''}${state.keepExt ? state.ext : ''}`;
  const constructionDesc = state.construction
    ? describeConstruction(state.construction)
    : `${state.containerStyle} architecture`;
  const flowPrompt = `You are a master brand identity designer. Create an original, vector-crafted professional logo for:
DOMAIN: ${state.domain}
1. MAIN LOGO — 750 × 450 pixels (5:3 aspect ratio).
2. SQUARE LOGO — 600 × 600 pixels (1:1 square icon).
INDUSTRY: ${state.nicheLabel}
SYMBOL: Minimalist geometric "${state.activeIcon}" emblem (${constructionDesc}).
TYPOGRAPHY: "${fullWordmark}" (${state.fontFamily}, high typographic contrast).
PALETTE: Primary Ink ${state.primary}, Brand Accent ${state.secondary}, Spark ${state.accent} on pure white #FFFFFF background.`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(flowPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRasterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const trimmed = autoTrimWhiteBackground(img);
        onUpdateRaster(trimmed.toDataURL('image/png'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const autoTrimWhiteBackground = (img: HTMLImageElement): HTMLCanvasElement => {
    const temp = document.createElement('canvas');
    temp.width = img.width;
    temp.height = img.height;
    const tCtx = temp.getContext('2d');
    if (!tCtx) return temp;

    tCtx.drawImage(img, 0, 0);
    const data = tCtx.getImageData(0, 0, temp.width, temp.height).data;
    let top = temp.height,
      left = temp.width,
      right = 0,
      bottom = 0;

    for (let y = 0; y < temp.height; y++) {
      for (let x = 0; x < temp.width; x++) {
        const i = (y * temp.width + x) * 4;
        if (data[i + 3] > 20 && (data[i] < 246 || data[i + 1] < 246 || data[i + 2] < 246)) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    if (right <= left || bottom <= top) return temp;
    const w = right - left + 1;
    const h = bottom - top + 1;
    const cropped = document.createElement('canvas');
    cropped.width = w;
    cropped.height = h;
    cropped.getContext('2d')?.drawImage(temp, left, top, w, h, 0, 0, w, h);
    return cropped;
  };

  return (
    <div className="space-y-4">
      {/* External Flow Prompt Reference */}
      <div className="bg-[#06080f] border border-[#232c42] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>Prompt for flow.google.com</span>
          </span>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
          </button>
        </div>
        <textarea
          readOnly
          rows={4}
          value={flowPrompt}
          className="w-full bg-[#080b13] border border-[#1b2333] rounded-lg p-2 text-[10px] font-mono text-slate-300 leading-relaxed outline-none resize-none"
        />
      </div>

      {/* Raster Upload Tool */}
      <div className="bg-[#06080f] border border-[#232c42] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drop/Paste External Logo (Raster)</span>
          </span>
          {state.rasterMode && (
            <button
              type="button"
              onClick={onClearRaster}
              className="text-[10px] text-rose-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Exit Raster Mode</span>
            </button>
          )}
        </div>
        <label className="block p-3 border-2 border-dashed border-[#232c42] hover:border-indigo-500 rounded-xl text-center cursor-pointer transition bg-[#080b13]/60">
          <input
            type="file"
            accept="image/*"
            onChange={handleRasterUpload}
            className="hidden"
          />
          <p className="text-xs font-semibold text-slate-200">
            {state.rasterMode ? 'Raster Logo Active (Click to Replace)' : 'Click to Upload or Paste (Ctrl+V) Image'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Auto-trims whitespace &amp; centers on 750×450 and 600×600 master canvases
          </p>
        </label>
      </div>
    </div>
  );
};
