"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Block closing (Esc / backdrop) while something is saving. */
  busy?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Native <dialog> wrapper: focus trapping and Esc come for free.
 * Children mount only while open, so forms inside start fresh each time.
 */
export function Modal({ open, title, onClose, busy, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/30",
        className,
      )}
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="font-display text-xl">
            {title}
          </h2>
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
