"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
};

export function Switch({ checked, onCheckedChange, label, hideLabel, disabled, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="group inline-flex items-center gap-2.5 disabled:opacity-50"
    >
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors",
          checked ? "bg-slate" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span className={cn("text-sm text-ink", hideLabel && "sr-only")}>{label}</span>
    </button>
  );
}
