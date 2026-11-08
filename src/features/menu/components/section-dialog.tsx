"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { handleFormError } from "@/lib/forms";
import {
  MAX_SIZES,
  SECTION_ICONS,
  sectionSchema,
  type Cafe,
  type Section,
  type SectionInput,
} from "@/lib/schemas/cafe";
import { sectionIconLabels, suggestSectionIcon } from "@/lib/section-icons";
import { cn } from "@/lib/utils";
import { sectionService } from "@/services/section.service";
import { SectionIcon } from "./section-icon";

const PRESETS: { label: string; sizes: string[] }[] = [
  { label: "One price", sizes: [] },
  { label: "Reg / Large", sizes: ["Reg", "Large"] },
  { label: "Half / Full", sizes: ["Half", "Full"] },
  { label: "Small / Med / Large", sizes: ["Small", "Med", "Large"] },
];

type SectionDialogProps = {
  open: boolean;
  /** Edit this section; omit to create a new one. */
  section?: Section;
  onClose: () => void;
  onSaved: (result: { cafe: Cafe; section: Section }) => void;
};

export function SectionDialog({ open, section, onClose, onSaved }: SectionDialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} title={section ? `Edit ${section.name}` : "New section"} onClose={onClose} busy={busy}>
      <SectionForm section={section} onCancel={onClose} onSaved={onSaved} onBusyChange={setBusy} />
    </Modal>
  );
}

function SectionForm({
  section,
  onCancel,
  onSaved,
  onBusyChange,
}: {
  section?: Section;
  onCancel: () => void;
  onSaved: SectionDialogProps["onSaved"];
  onBusyChange: (busy: boolean) => void;
}) {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [iconsOpen, setIconsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<SectionInput>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section?.name ?? "",
      note: section?.note ?? "",
      icon: section?.icon ?? "none",
      sizes: section?.sizes.map((s) => ({ sizeId: s.id, label: s.label })) ?? [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: "sizes" });
  const icon = useWatch({ control, name: "icon" }) ?? "none";

  /** Presets reuse existing size ids by position so dish prices carry over. */
  function applyPreset(labels: string[]) {
    replace(labels.map((label, i) => ({ sizeId: fields[i]?.sizeId, label })));
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    onBusyChange(true);
    try {
      const result = section
        ? await sectionService.update(section.id, values)
        : await sectionService.create(values);
      toast.success(section ? `${result.section.name} updated` : `${result.section.name} added`);
      onSaved(result);
    } catch (error) {
      setFormError(handleFormError(error, setError, ["name", "note", "sizes", "icon"]));
    } finally {
      onBusyChange(false);
    }
  });

  const sizesError = errors.sizes?.message ?? errors.sizes?.root?.message;
  const currentLabels = fields.map((f) => f.label).join("/");

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert>{formError}</Alert>}

      <Field
        id="section-name"
        label="Section name"
        hint={
          icon === "none"
            ? "Tap the icon box to add an icon next to the title."
            : `Icon: ${sectionIconLabels[icon]}. Tap it to change.`
        }
        error={errors.name?.message}
      >
        <div className="flex gap-2">
          {/* Icon dropdown: shows the current icon; opens the icon grid below. */}
          <button
            type="button"
            onClick={() => setIconsOpen((open) => !open)}
            aria-expanded={iconsOpen}
            aria-controls="section-icon-grid"
            aria-label={`Section icon: ${sectionIconLabels[icon]}. ${iconsOpen ? "Close" : "Choose"} icon`}
            className={cn(
              "flex h-11 shrink-0 items-center gap-1 rounded-xl border bg-surface pr-2 pl-2.5 text-roast/80 transition-colors hover:border-line-strong",
              iconsOpen ? "border-slate ring-3 ring-slate/15" : "border-line",
            )}
          >
            {icon === "none" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <rect x="4" y="4" width="16" height="16" rx="4" strokeDasharray="3 3" />
                <path d="M12 9v6M9 12h6" />
              </svg>
            ) : (
              <SectionIcon icon={icon} className="size-6" />
            )}
            <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("size-4 text-muted transition-transform", iconsOpen && "rotate-180")}>
              <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <Input
            placeholder="Crunchy Pizza"
            autoFocus
            {...fieldA11y("section-name", errors.name?.message, true)}
            {...register("name", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                // New sections: suggest an icon from the name until the owner picks one.
                if (!section && !getFieldState("icon").isDirty) setValue("icon", suggestSectionIcon(e.target.value));
              },
            })}
          />
        </div>
      </Field>

      {iconsOpen && (
        <fieldset id="section-icon-grid" className="-mt-2 rounded-2xl border border-line bg-paper p-3">
          <legend className="sr-only">Section icon</legend>
          <div className="grid grid-cols-6 gap-1.5">
            {SECTION_ICONS.map((key) => (
              <label key={key} className="cursor-pointer" title={sectionIconLabels[key]}>
                <input
                  type="radio"
                  value={key}
                  className="peer sr-only"
                  {...register("icon", { onChange: () => setIconsOpen(false) })}
                />
                <span className="sr-only">{sectionIconLabels[key]}</span>
                <span
                  aria-hidden="true"
                  className="flex h-11 items-center justify-center rounded-xl border border-line bg-surface text-roast/80 transition-colors peer-checked:border-slate peer-checked:bg-slate-soft peer-checked:text-slate peer-focus-visible:outline-2 peer-focus-visible:outline-slate hover:border-line-strong"
                >
                  {key === "none" ? (
                    <span className="text-xs text-muted">None</span>
                  ) : (
                    <SectionIcon icon={key} className="size-6" />
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {errors.icon?.message && (
        <p role="alert" className="-mt-2 text-sm text-danger">
          {errors.icon.message}
        </p>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-ink">Sizes</legend>
        <p className="mt-0.5 text-sm text-muted">Each size gets its own price column on the menu.</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => {
            const active = preset.sizes.join("/") === currentLabels;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.sizes)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-slate bg-slate-soft text-ink"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {fields.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {fields.map((field, index) => {
              const id = `size-${index}`;
              const error = errors.sizes?.[index]?.label?.message;
              return (
                <li key={field.id}>
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0 font-mono text-xs text-muted">Size {index + 1}</span>
                    <label htmlFor={id} className="sr-only">
                      Size {index + 1} name
                    </label>
                    <Input className="h-10" {...fieldA11y(id, error)} {...register(`sizes.${index}.label`)} />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove size ${index + 1}`}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M5 5l10 10M15 5L5 15" />
                      </svg>
                    </button>
                  </div>
                  {error && (
                    <p id={`${id}-error`} role="alert" className="mt-1 ml-16 text-sm text-danger">
                      {error}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {fields.length < MAX_SIZES && (
          <button
            type="button"
            onClick={() => append({ label: "" }, { shouldFocus: true })}
            className="mt-3 text-sm font-medium text-slate underline-offset-4 hover:underline"
          >
            + Add a size
          </button>
        )}
        {sizesError && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {sizesError}
          </p>
        )}
        {section && section.sizes.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Removing a size removes that price from every dish in this section.
          </p>
        )}
      </fieldset>

      <Field
        id="section-note"
        label="Note"
        optional
        hint="Shown under the section, e.g. “Add any topping for ₹20”."
        error={errors.note?.message}
      >
        <Input {...fieldA11y("section-note", errors.note?.message, true)} {...register("note")} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          {section ? "Save section" : "Add section"}
        </Button>
      </div>
    </form>
  );
}
