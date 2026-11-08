"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const controlStyles =
  "w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors hover:border-line-strong focus:border-slate focus:outline-none focus-visible:outline-none focus:ring-3 focus:ring-slate/15 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlStyles, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlStyles, "min-h-24 resize-y py-2.5", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(controlStyles, "h-11 appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
      >
        <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Text input with a fixed prefix, e.g. a URL base or currency symbol. */
/** Bordered shell for inputs with something attached (prefix, toggle button). */
const groupStyles =
  "flex h-11 items-center overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong focus-within:border-slate focus-within:ring-3 focus-within:ring-slate/15 has-aria-invalid:border-danger";

const bareInputStyles =
  "h-full w-full min-w-0 bg-transparent px-3 text-[0.95rem] text-ink placeholder:text-muted/70 focus:outline-none";

export function PrefixInput({
  prefix,
  className,
  ...props
}: ComponentProps<"input"> & { prefix: string }) {
  return (
    <div className={cn(groupStyles, className)}>
      <span className="shrink-0 border-r border-line bg-paper px-3 font-mono text-sm leading-[2.75rem] text-muted">
        {prefix}
      </span>
      <input className={bareInputStyles} {...props} />
    </div>
  );
}

/** Indian mobile number: fixed +91 prefix, the owner types the 10 digits. */
export function PhoneInput(props: Omit<ComponentProps<"input">, "type" | "prefix">) {
  return (
    <PrefixInput
      prefix="+91"
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="98765 43210"
      {...props}
    />
  );
}

/** Password field with a show/hide toggle. */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={cn(groupStyles, "pr-1", className)}>
      <input
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn(bareInputStyles, "px-3.5")}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.75" />
          {visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
