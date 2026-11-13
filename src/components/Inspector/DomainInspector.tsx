import React from 'react';
import { Grid } from 'lucide-react';
import { TLDWATCH_223_DOMAINS } from '../../data/domains';
import { DomainIconGroups } from '../../data/domainIconGroups';
import { resolveLucideIcon } from '../../utils/svgBuilder';

interface DomainInspectorProps {
  currentDomain: string;
  nicheLabel: string;
  onSelectDomain: (domain: string) => void;
  onOpenVault: () => void;
}

export const DomainInspector: React.FC<DomainInspectorProps> = ({
  currentDomain,
  nicheLabel,
  onSelectDomain,
  onOpenVault,
}) => {
  return (
    <div className="bg-[#0b0f1a] border border-[#1b2333] rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Domain &amp; Industry Niche
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 truncate max-w-[200px]">
          {nicheLabel}
        </span>
      </div>

      <div className="flex gap-2">
        <select
          value={currentDomain}
          onChange={(e) => onSelectDomain(e.target.value)}
          className="flex-1 bg-[#06080f] border border-[#232c42] hover:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold outline-none transition cursor-pointer"
        >
          {TLDWATCH_223_DOMAINS.map((dom) => (
            <option key={dom} value={dom}>
              {dom}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onOpenVault}
          className="px-2.5 py-2 bg-[#121828] hover:bg-[#1a233b] text-slate-300 border border-[#232d44] rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
          title="Open Vault with 1,600+ vector symbols"
        >
          <Grid className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">All Symbols</span>
        </button>
      </div>
    </div>
  );
};

interface DomainSymbolsSelectorProps {
  currentDomain: string;
  icons10: string[];
  iconGroups?: DomainIconGroups;
  activeIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export const DomainSymbolsSelector: React.FC<DomainSymbolsSelectorProps> = ({
  currentDomain,
  icons10,
  iconGroups,
  activeIcon,
  onSelectIcon,
}) => {
  const coreIcons = iconGroups?.core ?? icons10.slice(0, 4);
  const word1Label = iconGroups?.word1.label ?? 'Word 1';
  const word1Icons = iconGroups?.word1.icons ?? icons10.slice(4, 7);
  const word2Label = iconGroups?.word2.label ?? 'Word 2';
  const word2Icons = iconGroups?.word2.icons ?? icons10.slice(7, 10);

  const renderIconButton = (ico: string, idx: number, rowKey: string) => {
    const IconComp = resolveLucideIcon(ico);
    const isSelected = ico.toLowerCase() === activeIcon.toLowerCase();
    return (
      <button
        key={`${rowKey}-${ico}-${idx}`}
        type="button"
        onClick={() => onSelectIcon(ico)}
        title={ico}
        className={`p-1.5 rounded-lg text-[10px] font-mono flex flex-col items-center justify-center gap-1 border transition cursor-pointer ${
          isSelected
            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
            : 'bg-[#06080f] hover:bg-[#111728] text-slate-300 border-[#20293d]'
        }`}
      >
        <IconComp size={16} strokeWidth={2.2} />
        <span className="text-[8px] truncate w-full text-center">
          {ico.length > 7 ? ico.slice(0, 6) + '…' : ico}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[210px]">
          10 Symbols for <strong className="text-slate-200">{currentDomain}</strong>:
        </span>
        <span className="text-[10px] text-slate-500">Click to apply</span>
      </div>

      {/* Row 1: Concept (4 icons) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-indigo-300">Concept</span>
          <span className="text-[9px] text-slate-500">4 core symbols</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {coreIcons.map((ico, idx) => renderIconButton(ico, idx, 'core'))}
        </div>
      </div>

      {/* Row 2: Word 1 (3 icons) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300 truncate max-w-[180px]">{word1Label}</span>
          <span className="text-[9px] text-slate-500">3 symbols</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {word1Icons.map((ico, idx) => renderIconButton(ico, idx, 'w1'))}
        </div>
      </div>

      {/* Row 3: Word 2 (3 icons) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300 truncate max-w-[180px]">{word2Label}</span>
          <span className="text-[9px] text-slate-500">3 symbols</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {word2Icons.map((ico, idx) => renderIconButton(ico, idx, 'w2'))}
        </div>
      </div>
    </div>
  );
};
