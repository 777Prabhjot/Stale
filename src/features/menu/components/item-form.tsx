"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type Control, type FieldError } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { Input, PrefixInput, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useAuth, useSession } from "@/features/auth/auth-provider";
import { routes } from "@/lib/config";
import { handleFormError } from "@/lib/forms";
import { currencySymbol } from "@/lib/pricing";
import { BASE_SIZE_ID, type Currency, type Section } from "@/lib/schemas/cafe";
import {
  DIETARY_OPTIONS,
  ITEM_TAGS,
  menuItemSchema,
  type DiscountType,
  type MenuItem,
  type MenuItemData,
  type MenuItemInput,
} from "@/lib/schemas/menu-item";
import { cn } from "@/lib/utils";
import { menuService } from "@/services/menu.service";
import { getSizePrices } from "../utils";
import { DietaryMark, dietaryLabels } from "./dietary-mark";
import { DiscountBadge, PriceTag, TagBadge, tagLabels } from "./price-tag";
import { SectionDialog } from "./section-dialog";

const FIELDS = [
  "name",
  "description",
  "sectionId",
  "prices",
  "discountType",
  "discountValue",
  "dietary",
  "tag",
  "isAvailable",
] as const;

const discountOptions: { value: DiscountType; label: string }[] = [
  { value: "none", label: "No discount" },
  { value: "percent", label: "% off" },
  { value: "flat", label: "Amount off" },
];

const chip =
  "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-muted transition-colors peer-checked:border-slate peer-checked:bg-slate-soft peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-slate hover:border-line-strong";

const toNumber = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : Number(value);

type FormControl = Control<MenuItemInput, unknown, MenuItemData>;

export function ItemForm({ item }: { item?: MenuItem }) {
  const { cafe } = useSession();
  const { refresh, setCafe } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [creatingSection, setCreatingSection] = useState(false);
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemInput, unknown, MenuItemData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description,
          sectionId: item.sectionId,
          prices: item.prices,
          discountType: item.discountType,
          discountValue: item.discountValue,
          dietary: item.dietary,
          tag: item.tag,
          isAvailable: item.isAvailable,
        }
      : {
          name: "",
          description: "",
          sectionId: cafe.sections[0]?.id ?? "",
          prices: {},
          discountType: "none",
          discountValue: undefined,
          dietary: "veg",
          tag: "none",
          isAvailable: true,
        },
  });

  const discountType = useWatch({ control, name: "discountType" });
  const sectionId = useWatch({ control, name: "sectionId" });
  const section = cafe.sections.find((s) => s.id === sectionId);
  const symbol = currencySymbol(cafe.currency);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const saved = item ? await menuService.update(item.id, values) : await menuService.create(values);
      await refresh();
      toast.success(isEdit ? `${saved.name} updated` : `${saved.name} added to your menu`);
      router.push(routes.dashboard);
    } catch (error) {
      setFormError(handleFormError(error, setError, FIELDS));
    }
  });

  // `prices` is a record, so its errors mix a group-level message with per-size entries.
  // Read each through its own narrow view.
  // The resolver files the group error under `.root` when size ids start with digits (UUIDs
  // like "5691…" look like array indexes to it), and directly on `prices` otherwise.
  const pricesGroupError = errors.prices as (FieldError & { root?: FieldError }) | undefined;
  const pricesError = pricesGroupError?.message ?? pricesGroupError?.root?.message;
  const sizeErrors = errors.prices as Record<string, FieldError | undefined> | undefined;

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6">
          {formError && <Alert>{formError}</Alert>}

          <Field id="name" label="Dish name" error={errors.name?.message}>
            <Input placeholder="Farm Fresh Pizza" {...fieldA11y("name", errors.name?.message)} {...register("name")} />
          </Field>

          <Field id="sectionId" label="Section" error={errors.sectionId?.message}>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                {/* Remount when sections change so a newly created section's option is selectable. */}
                <Select
                  key={cafe.sections.map((s) => s.id).join()}
                  {...fieldA11y("sectionId", errors.sectionId?.message)}
                  {...register("sectionId")}
                >
                  {cafe.sections.length === 0 && <option value="">No sections yet</option>}
                  {cafe.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.sizes.length ? ` (${s.sizes.map((z) => z.label).join(" / ")})` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <Button variant="secondary" onClick={() => setCreatingSection(true)}>
                New section
              </Button>
            </div>
          </Field>

          {/* Keyed by section so price inputs for the old section unregister on change. */}
          <fieldset key={section?.id ?? "none"}>
            <legend className="text-sm font-medium text-ink">{section?.sizes.length ? "Prices" : "Price"}</legend>
            {section && section.sizes.length > 0 && (
              <p className="mt-0.5 text-sm text-muted">Leave a size blank if this dish doesn&apos;t come in it.</p>
            )}
            <div className={cn("mt-2 grid gap-3", section?.sizes.length ? "grid-cols-2 sm:grid-cols-4" : "max-w-48")}>
              {getSizePrices({ prices: {} }, section).map(({ sizeId, label }) => {
                const id = `price-${sizeId}`;
                const error = sizeErrors?.[sizeId]?.message;
                return (
                  <div key={sizeId} className="flex flex-col gap-1">
                    {label && (
                      <label htmlFor={id} className="text-xs text-muted">
                        {label}
                      </label>
                    )}
                    <PrefixInput
                      prefix={symbol}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder={label ? "—" : "220"}
                      aria-label={label ? `${label} price` : "Price"}
                      {...fieldA11y(id, error ?? pricesError)}
                      {...register(`prices.${sizeId}`, { setValueAs: toNumber, shouldUnregister: true })}
                    />
                    {error && (
                      <p id={`${id}-error`} role="alert" className="text-sm text-danger">
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {pricesError && (
              <p id={`price-${BASE_SIZE_ID}-error`} role="alert" className="mt-1.5 text-sm text-danger">
                {pricesError}
              </p>
            )}
          </fieldset>

          <Field id="description" label="Description" optional error={errors.description?.message}>
            <Textarea
              rows={2}
              placeholder="Olives, jalapeño, mushroom, onion, capsicum, tomato"
              {...fieldA11y("description", errors.description?.message)}
              {...register("description")}
            />
          </Field>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Food type</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option} className="cursor-pointer">
                  <input type="radio" value={option} className="peer sr-only" {...register("dietary")} />
                  <span className={chip}>
                    <DietaryMark dietary={option} />
                    {option === "unspecified" ? "Don't show" : dietaryLabels[option]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Highlight</legend>
            <p className="mt-0.5 text-sm text-muted">Makes the dish stand out on your menu.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ITEM_TAGS.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="radio" value={tag} className="peer sr-only" {...register("tag")} />
                  <span className={chip}>{tagLabels[tag]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-line bg-surface p-5">
            <legend className="px-1 text-sm font-medium text-ink">Discount</legend>
            <div className="flex flex-wrap gap-1 rounded-full bg-paper p-1">
              {discountOptions.map((option) => (
                <label key={option.value} className="flex-1 cursor-pointer">
                  <input type="radio" value={option.value} className="peer sr-only" {...register("discountType")} />
                  <span className="block rounded-full px-3 py-1.5 text-center text-sm whitespace-nowrap text-muted transition-colors peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-slate">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {discountType !== "none" && (
              <Field
                id="discountValue"
                label={discountType === "percent" ? "Percentage off" : "Amount off"}
                hint={section && section.sizes.length > 1 ? "Applies to every size." : undefined}
                error={errors.discountValue?.message}
                className="mt-5 max-w-56"
              >
                <PrefixInput
                  prefix={discountType === "percent" ? "%" : symbol}
                  type="number"
                  inputMode="decimal"
                  step={discountType === "percent" ? "1" : "0.01"}
                  min="0"
                  placeholder={discountType === "percent" ? "15" : "30"}
                  {...fieldA11y("discountValue", errors.discountValue?.message, true)}
                  {...register("discountValue", { setValueAs: toNumber, shouldUnregister: true })}
                />
              </Field>
            )}
          </fieldset>

          <Controller
            control={control}
            name="isAvailable"
            render={({ field }) => (
              <div>
                <Switch checked={field.value} onCheckedChange={field.onChange} label="Available to order" />
                <p className="mt-1 ml-12.5 text-sm text-muted">Turn off to show it as sold out.</p>
              </div>
            )}
          />

          <div className="flex gap-2 border-t border-line pt-6">
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Save changes" : "Add dish"}
            </Button>
            <Link href={routes.dashboard} className="inline-flex h-11 items-center rounded-full px-5 text-muted hover:text-ink">
              Cancel
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Preview">
          <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">On your menu</p>
          <ItemPreview control={control} section={section} currency={cafe.currency} />
        </aside>
      </form>

      {/* Outside the <form> above: nested forms aren't allowed. */}
      <SectionDialog
        open={creatingSection}
        onClose={() => setCreatingSection(false)}
        onSaved={({ cafe: updated, section: created }) => {
          setCafe(updated);
          setValue("sectionId", created.id, { shouldValidate: true });
          setCreatingSection(false);
        }}
      />
    </>
  );
}

function ItemPreview({
  control,
  section,
  currency,
}: {
  control: FormControl;
  section: Section | undefined;
  currency: Currency;
}) {
  const values = useWatch({ control });
  const discountValue =
    typeof values.discountValue === "number" && Number.isFinite(values.discountValue)
      ? values.discountValue
      : undefined;
  const discount = { discountType: values.discountType ?? "none", discountValue };
  const prices = Object.fromEntries(
    Object.entries(values.prices ?? {}).filter(
      (e): e is [string, number] => typeof e[1] === "number" && Number.isFinite(e[1]) && e[1] > 0,
    ),
  );
  const columns = getSizePrices({ prices }, section);
  const sized = Boolean(section?.sizes.length);
  const available = values.isAvailable ?? true;
  const dietary = values.dietary ?? "unspecified";

  const grid = { gridTemplateColumns: `minmax(0,1fr) repeat(${columns.length}, 3.25rem)` };
  const name = values.name?.trim() || "Dish name";

  return (
    <div className={cn("mt-3 rounded-2xl border border-line bg-surface p-5", !available && "opacity-55")}>
      {sized ? (
        <>
          <div className="mb-1.5 grid gap-x-1.5" style={grid} aria-hidden="true">
            <span />
            {columns.map((c) => (
              <span key={c.sizeId} className="text-right font-mono text-[0.65rem] tracking-wide text-muted uppercase">
                {c.label}
              </span>
            ))}
          </div>
          {/* Same wrap-safe layout as the public menu, on the card's white background. */}
          <div className="grid items-end gap-x-1.5" style={grid}>
            <div className="flex min-w-0">
              {dietary !== "unspecified" && (
                <span className="mt-[0.3em] mr-2 shrink-0 self-start">
                  <DietaryMark dietary={dietary} />
                </span>
              )}
              <span className="leader-fill min-w-0 flex-1 leading-snug text-ink">
                <span className="leader-text bg-surface!">{name}</span>
              </span>
            </div>
            {columns.map((c) => (
              <span key={c.sizeId} className="text-right">
                {c.amount ? (
                  <PriceTag amount={c.amount} discount={discount} currency={currency} stacked />
                ) : (
                  <span className="font-mono text-muted">–</span>
                )}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-baseline">
          <DietaryMark dietary={dietary} />
          <span className={cn("min-w-0 text-ink", dietary !== "unspecified" && "ml-2")}>{name}</span>
          <span className="leader" />
          {columns[0].amount ? (
            <PriceTag amount={columns[0].amount} discount={discount} currency={currency} />
          ) : (
            <span className="font-mono text-muted">—</span>
          )}
        </div>
      )}
      {values.description?.trim() && <p className="mt-1.5 text-sm leading-relaxed text-muted">{values.description}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <TagBadge tag={values.tag ?? "none"} />
        <DiscountBadge discount={discount} currency={currency} />
        {!available && <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">Sold out</span>}
      </div>
    </div>
  );
}
