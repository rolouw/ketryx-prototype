import { useEffect } from 'react';

export interface ToastMessage {
  /** Changes with every message, so the same text shown twice restarts the timer. */
  key: number;
  text: string;
  onUndo?: () => void;
}

/** Short confirmation at the bottom of the screen that dismisses itself. */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.key} className="toast">
          <span>{toast.text}</span>
          {toast.onUndo && (
            <button
              type="button"
              className="toast-undo"
              onClick={() => {
                toast.onUndo?.();
                onDismiss();
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
