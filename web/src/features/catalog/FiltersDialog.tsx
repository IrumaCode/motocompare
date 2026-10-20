import { XIcon } from '@phosphor-icons/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { pluralize } from '../../lib/format';

interface FiltersDialogProps {
  open: boolean;
  onClose: () => void;
  resultCount: number | null;
  children: ReactNode;
}

/**
 * Mobile bottom sheet built on the native <dialog>: showModal() gives a focus trap, Esc to close,
 * an inert background and focus back on the "Filtros" button for free.
 * Filters apply live; the footer button only closes the sheet.
 */
export function FiltersDialog({ open, onClose, resultCount, children }: FiltersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="filters-dialog-title"
      onClose={onClose}
      // A click on the <dialog> itself (not on its content) is a click on the backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="mx-0 mt-auto mb-0 max-h-[85dvh] w-full max-w-full rounded-t-2xl border-t border-line bg-canvas p-0 text-ink backdrop:bg-black/60"
    >
      {/* Content only exists while open: no duplicate ids with the desktop sidebar */}
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
            <h2 id="filters-dialog-title" className="text-lg font-semibold">
              Filtros
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar filtros"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-2"
            >
              <XIcon />
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-5">{children}</div>
          <div className="border-t border-line p-4">
            <Button onClick={onClose} className="w-full">
              {resultCount === null
                ? 'Ver motos'
                : `Ver ${pluralize(resultCount, 'moto', 'motos')}`}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
