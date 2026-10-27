import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that names the dialog, usually its heading. */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

/**
 * Modal built on the native <dialog>: focus trap, Escape to close and the backdrop come for free.
 * Content only mounts while open, so form state resets each time the modal opens.
 */
export function Modal({ open, onClose, labelledBy, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className ? `modal ${className}` : 'modal'}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // The content fills the dialog, so a click landing on the dialog itself is a click on the backdrop.
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && children}
    </dialog>
  );
}
