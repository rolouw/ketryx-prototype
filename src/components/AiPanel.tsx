import { useEffect, useRef, useState } from 'react';
import { ICONS, Icon } from './Icon';
import { RowMenu } from './RowMenu';

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

const MODELS = ['Opus 5.5', 'Sonnet 5.5', 'Haiku 5.5'];

/**
 * Stays mounted so it can slide in and out: the dock animates its width, which lets the main
 * panel resize smoothly instead of jumping. While closed it is inert (no focus, hidden from AT).
 */
export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dockRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [wide, setWide] = useState(false);
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState(MODELS[0]);

  useEffect(() => {
    dockRef.current?.toggleAttribute('inert', !open);
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  const newChat = () => {
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <div ref={dockRef} className={wide ? 'ai-dock is-wide' : 'ai-dock'} data-open={open}>
      <aside id="ai-panel" aria-labelledby="ai-panel-title" className="ai-panel">
        <div className="ai-panel-head">
          <h2 id="ai-panel-title">AI Assistant</h2>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={wide}
            aria-label={wide ? 'Make AI assistant narrower' : 'Make AI assistant wider'}
            onClick={() => setWide((w) => !w)}
          >
            <Icon d={wide ? ICONS.collapse : ICONS.expand} strokeWidth={2} />
          </button>
          {/* Placeholders: neither item leads anywhere yet beyond clearing the draft. */}
          <RowMenu
            label="AI assistant options"
            items={[
              { label: 'New chat', icon: ICONS.plus, onSelect: newChat },
              { label: 'Learn & Assist', icon: ICONS.help, onSelect: () => {} },
            ]}
          />
          <button type="button" className="icon-btn" aria-label="Close AI assistant" onClick={onClose}>
            <Icon d={ICONS.close} strokeWidth={2} />
          </button>
        </div>

        <div className="ai-body">
          <div className="ai-intro">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--purple)" aria-hidden="true">
              <path d="M12 2l2.2 6.3L21 10l-6.8 1.7L12 18l-2.2-6.3L3 10l6.8-1.7z" />
            </svg>
            <p>Create, search, refine your items and documents.</p>
          </div>

          {/* Nothing is sent in this prototype; the form only shows the composer's controls. */}
          <form className="ai-composer" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span className="sr-only">Message the AI assistant</span>
              <textarea ref={inputRef} rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Do anything" />
            </label>
            <div className="ai-composer-bar">
              <button type="button" className="icon-btn icon-btn-sm" aria-label="Add files or context">
                <Icon d={ICONS.plus} size={18} strokeWidth={2} />
              </button>
              <button type="button" className="icon-btn icon-btn-sm" aria-label="Tools and settings">
                <Icon d={ICONS.sliders} size={18} strokeWidth={1.8} />
              </button>
              <span className="ai-model">
                <span className="ai-model-name">{model}</span>
                <span className="ai-model-effort">Medium</span>
                <Icon d={ICONS.chevronDown} size={14} strokeWidth={2.2} />
                <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
                  {MODELS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </span>
              <button type="submit" className="ai-send" aria-label="Send" disabled={draft.trim() === ''}>
                <Icon d={ICONS.arrowUp} size={18} strokeWidth={2.2} />
              </button>
            </div>
          </form>
        </div>

        <p className="disclaimer">Specific results and suggestions are not validated by Ketryx and should be reviewed carefully.</p>
      </aside>
    </div>
  );
}
