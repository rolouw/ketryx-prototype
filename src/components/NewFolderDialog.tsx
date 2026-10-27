import { useState } from 'react';
import { Modal } from './Modal';

interface NewFolderDialogProps {
  open: boolean;
  /** Names already taken, compared case-insensitively. */
  existingNames: string[];
  onCancel: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderDialog({ open, existingNames, onCancel, onCreate }: NewFolderDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="new-folder-title">
      <NewFolderForm existingNames={existingNames} onCancel={onCancel} onCreate={onCreate} />
    </Modal>
  );
}

function NewFolderForm({ existingNames, onCancel, onCreate }: Omit<NewFolderDialogProps, 'open'>) {
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const duplicate = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed !== '' && !duplicate;

  return (
    <form
      className="modal-body"
      onSubmit={(e) => {
        e.preventDefault();
        if (canCreate) onCreate(trimmed);
      }}
    >
      <h2 id="new-folder-title">New folder</h2>
      <label className="field">
        <span className="field-label">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cardiology devices"
          maxLength={80}
          aria-invalid={duplicate}
          aria-describedby={duplicate ? 'new-folder-error' : undefined}
        />
      </label>
      {duplicate && (
        <p id="new-folder-error" className="field-error">
          A folder with this name already exists.
        </p>
      )}
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
