import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

const STYLES: Record<ToastKind, string> = {
  success: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  info: 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100',
};

const ICONS: Record<ToastKind, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function useToasts() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const nextId = React.useRef(1);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = React.useCallback(
    (kind: ToastKind, text: string, ms = kind === 'error' ? 9000 : 6000) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );
  return { toasts, push, dismiss };
}

export const ToastStack: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
  <div
    aria-live="polite"
    className="fixed z-[100] bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[min(92vw,440px)] flex flex-col gap-2 pointer-events-none"
  >
    {toasts.map((t) => {
      const Icon = ICONS[t.kind];
      return (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12px] leading-snug shadow-2xl backdrop-blur-xl ${STYLES[t.kind]}`}
        >
          <Icon className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{t.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    })}
  </div>
);
