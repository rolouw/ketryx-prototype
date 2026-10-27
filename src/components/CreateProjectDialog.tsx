import { useId, useState, type KeyboardEvent } from 'react';
import { Collapse } from './Collapse';
import { ICONS, Icon } from './Icon';
import { NO_FOLDER, NO_FOLDER_LABEL, type Folder, type NewProject } from '../data';
import { Modal } from './Modal';

interface CreateProjectDialogProps {
  open: boolean;
  /** Project names already taken, compared case-insensitively. */
  existingNames: string[];
  /** Project keys already taken. */
  existingKeys: string[];
  folders: Folder[];
  /** Preselected folder id, e.g. the folder page the dialog was opened from. */
  defaultFolder: string;
  onCancel: () => void;
  onCreate: (project: NewProject) => void;
}

export function CreateProjectDialog({ open, onCancel, ...rest }: CreateProjectDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="create-project-title" className="modal-wide">
      <CreateProjectForm onCancel={onCancel} {...rest} />
    </Modal>
  );
}

/** Keys are upper-case letters and digits, starting with a letter. */
const toKey = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);

function CreateProjectForm({ existingNames, existingKeys, folders, defaultFolder, onCancel, onCreate }: Omit<CreateProjectDialogProps, 'open'>) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [folder, setFolder] = useState(defaultFolder);
  const [repositories, setRepositories] = useState<string[]>([]);

  const trimmed = name.trim();
  const nameTaken = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const keyError = key === '' ? null : !/^[A-Z]/.test(key) ? 'The project key must start with a letter.' : existingKeys.includes(key) ? 'This project key is already in use.' : null;
  const canCreate = trimmed !== '' && !nameTaken && keyError === null;

  return (
    <form
      className="modal-body"
      onSubmit={(e) => {
        e.preventDefault();
        if (canCreate) onCreate({ name: trimmed, key, repositories, folder });
      }}
    >
      <h2 id="create-project-title">Create project</h2>
      <hr className="modal-divider" />

      <label className="field field-primary">
        <span className="field-label">Project name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Patient monitoring system"
          maxLength={120}
          aria-invalid={nameTaken}
          aria-describedby="project-name-hint"
        />
      </label>
      <p id="project-name-hint" className={nameTaken ? 'field-error' : 'field-hint'}>
        {nameTaken ? 'A project with this name already exists.' : 'Enter a project name to create the project.'}
      </p>

      <label className="field field-spaced">
        <span className="field-label is-regular">Project key</span>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(toKey(e.target.value))}
          placeholder="e.g. ACME"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={keyError !== null}
          aria-describedby="project-key-hint"
        />
      </label>
      <p id="project-key-hint" className={keyError ? 'field-error' : 'field-hint'}>
        {keyError ?? 'Sets the middle part of Ketryx item keys (e.g. KX-PROJ-1 where PROJ is the project key).'}
      </p>

      <label className="field field-spaced">
        <span className="field-label is-regular">Add to which folder</span>
        <span className="select-wrap">
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value={NO_FOLDER}>{NO_FOLDER_LABEL}</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <Icon d={ICONS.chevronDown} size={16} strokeWidth={2.2} />
        </span>
      </label>

      <div className="section-head">
        <h3>Organization connections</h3>
        <button type="button" className="btn btn-outline btn-sm">
          Manage connections
        </button>
      </div>
      <RepositoriesCard
        repositories={repositories}
        onAdd={(url) => setRepositories((r) => [...r, url])}
        onRemove={(url) => setRepositories((r) => r.filter((x) => x !== url))}
      />

      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!canCreate}>
          Create
        </button>
      </div>
    </form>
  );
}

/** Accepts http(s) URLs with at least an owner and a repository segment, e.g. https://github.com/org/repo. */
function parseRepoUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const segments = url.pathname.split('/').filter(Boolean);
    if (!/^https?:$/.test(url.protocol) || segments.length < 2) return null;
    return `${url.origin}/${segments.slice(0, 2).join('/').replace(/\.git$/, '')}`;
  } catch {
    return null;
  }
}

interface RepositoriesCardProps {
  repositories: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}

function RepositoriesCard({ repositories, onAdd, onRemove }: RepositoriesCardProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bodyId = useId();
  const count = repositories.length;

  const add = () => {
    const parsed = parseRepoUrl(url);
    if (!parsed) return setError('Enter a full repository URL, like https://github.com/org/repository.');
    if (repositories.includes(parsed)) return setError('This repository is already added.');
    onAdd(parsed);
    setUrl('');
    setError(null);
  };

  // Enter adds the URL instead of submitting the whole form.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (url.trim()) add();
    }
  };

  return (
    <div className="connection-card">
      <button type="button" className="connection-head" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="connection-icon">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="connection-text">
          <span className="connection-title">Repositories</span>
          <span className="connection-sub">Add repositories by URL</span>
        </span>
        <span className="connection-status">{count === 0 ? 'No repositories added' : `${count} ${count === 1 ? 'repository' : 'repositories'} added`}</span>
        <Icon d={ICONS.chevronDown} size={16} strokeWidth={2.2} className="chevron" />
      </button>

      <Collapse open={open}>
        <div id={bodyId} className="connection-body">
          <div className="repo-add">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={onKeyDown}
              placeholder="https://github.com/org/repository"
              aria-label="Repository URL"
              aria-invalid={error !== null}
              aria-describedby={error ? `${bodyId}-error` : undefined}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={add} disabled={!url.trim()}>
              Add
            </button>
          </div>
          {error && (
            <p id={`${bodyId}-error`} className="field-error">
              {error}
            </p>
          )}
          {count > 0 && (
            <ul className="repo-list">
              {repositories.map((r) => (
                <li key={r}>
                  <span className="repo-name" title={r}>
                    {r.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                  <button type="button" className="icon-btn icon-btn-sm" aria-label={`Remove ${r}`} onClick={() => onRemove(r)}>
                    <Icon d={ICONS.close} size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Collapse>
    </div>
  );
}
