import { useEffect, useRef } from 'react';
import { ICONS, Icon } from './Icon';

/** Floating pill that opens the AI panel; hidden while the panel is open. */
export function AiLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="ai-launcher" aria-expanded={false} aria-controls="ai-panel" onClick={onOpen}>
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 7l1.6 4.4L16 13l-4.4 1.6L10 19l-1.6-4.4L4 13l4.4-1.6z" fill="#C39EFE" />
        <path d="M18.5 3l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="#EBEBFF" />
      </svg>
      AI assistant
    </button>
  );
}

/**
 * Stays mounted so it can slide in and out: the dock animates its width, which lets the main
 * panel resize smoothly instead of jumping. While closed it is inert (no focus, hidden from AT).
 */
export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dockRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    dockRef.current?.toggleAttribute('inert', !open);
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div ref={dockRef} className="ai-dock" data-open={open}>
      <aside id="ai-panel" aria-label="AI assistant" className="ai-panel">
        <div className="ai-panel-head">
          <h2>AI assistant</h2>
          <button type="button" className="icon-btn" aria-label="Close AI assistant" onClick={onClose}>
            <Icon d={ICONS.close} strokeWidth={2} />
          </button>
        </div>
        <div className="ai-intro">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--purple)" aria-hidden="true">
            <path d="M12 2l2.2 6.3L21 10l-6.8 1.7L12 18l-2.2-6.3L3 10l6.8-1.7z" />
          </svg>
          <p>Effortlessly create, search, analyze, and refine your configuration items and documents.</p>
        </div>
        <label className="ai-input">
          <span className="sr-only">Ask the AI assistant</span>
          <textarea ref={inputRef} rows={3} placeholder="Ask anything, or select a category below to explore prompts" />
        </label>
        <button type="button" className="btn btn-outline btn-ai">
          Learn &amp; Assist
        </button>
        <p className="disclaimer">Specific results and suggestions are not validated by Ketryx and should be reviewed carefully.</p>
      </aside>
    </div>
  );
}
