"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { Input, PrefixInput, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth, useSession } from "@/features/auth/auth-provider";
import { getErrorMessage } from "@/lib/errors";
import { handleFormError } from "@/lib/forms";
import {
  CURRENCIES,
  MAX_NOTICES,
  cafeProfileFormSchema,
  type CafeProfile,
  type CafeProfileFormInput,
} from "@/lib/schemas/cafe";
import { cafeService } from "@/services/cafe.service";
import { resizeImage } from "./resize-image";

const FIELDS = [
  "name",
  "slug",
  "tagline",
  "address",
  "phone",
  "currency",
  "logo",
  "notices",
  "instagram",
  "facebook",
  "zomato",
  "swiggy",
] as const;

const currencyLabels: Record<(typeof CURRENCIES)[number], string> = {
  INR: "Indian rupee (₹)",
  USD: "US dollar ($)",
  EUR: "Euro (€)",
  GBP: "British pound (£)",
  AED: "UAE dirham (AED)",
};

const socialFields = [
  { name: "instagram", label: "Instagram", placeholder: "instagram.com/yourcafe" },
  { name: "facebook", label: "Facebook", placeholder: "facebook.com/yourcafe" },
  { name: "zomato", label: "Zomato", placeholder: "zomato.com/…" },
  { name: "swiggy", label: "Swiggy", placeholder: "swiggy.com/…" },
] as const;

export function SettingsForm() {
  const { cafe } = useSession();
  const { setCafe } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<CafeProfileFormInput, unknown, CafeProfile>({
    resolver: zodResolver(cafeProfileFormSchema),
    defaultValues: toFormValues(cafe),
  });

  // `values` is the validated profile (notices already split into a list); the API checks it again.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const updated = await cafeService.updateProfile(values);
      setCafe(updated);
      reset(toFormValues(updated));
      toast.success("Settings saved");
    } catch (error) {
      setFormError(handleFormError(error, setError, FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-10">
      {formError && <Alert>{formError}</Alert>}

      <Group title="Café">
        <LogoField
          value={useWatch({ control, name: "logo" })}
          error={errors.logo?.message}
          onChange={(logo) => setValue("logo", logo, { shouldDirty: true, shouldValidate: true })}
        />

        <Field id="name" label="Café name" error={errors.name?.message}>
          <Input {...fieldA11y("name", errors.name?.message)} {...register("name")} />
        </Field>

        <Field id="tagline" label="Tagline" optional hint="Shown under your name on the menu." error={errors.tagline?.message}>
          <Input
            placeholder="Not just a coffee shop, but much more"
            {...fieldA11y("tagline", errors.tagline?.message, true)}
            {...register("tagline")}
          />
        </Field>

        <Field
          id="slug"
          label="Menu link"
          hint={
            dirtyFields.slug
              ? "Changing this changes your QR code. Printed codes will stop working."
              : "The address your QR code opens."
          }
          error={errors.slug?.message}
        >
          <PrefixInput
            prefix="/m/"
            autoCapitalize="none"
            spellCheck={false}
            {...fieldA11y("slug", errors.slug?.message, true)}
            {...register("slug")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="phone" label="Phone" optional error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...fieldA11y("phone", errors.phone?.message)} {...register("phone")} />
          </Field>

          <Field id="currency" label="Currency" error={errors.currency?.message}>
            <Select {...fieldA11y("currency", errors.currency?.message)} {...register("currency")}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {currencyLabels[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field id="address" label="Address" optional error={errors.address?.message}>
          <Input autoComplete="street-address" {...fieldA11y("address", errors.address?.message)} {...register("address")} />
        </Field>
      </Group>

      <Group title="Notices" description="Short messages at the top of your menu, before customers order.">
        <Field
          id="notices"
          label="Notices"
          optional
          hint={`One per line, up to ${MAX_NOTICES}.`}
          error={errors.notices?.message}
        >
          <Textarea
            rows={3}
            placeholder={"Please wait 15–20 minutes after ordering\nCounter order, self service"}
            {...fieldA11y("notices", errors.notices?.message, true)}
            {...register("notices")}
          />
        </Field>
      </Group>

      <Group title="Links" description="Shown as buttons under your name. Leave blank to hide.">
        <div className="grid gap-6 sm:grid-cols-2">
          {socialFields.map((f) => (
            <Field key={f.name} id={f.name} label={f.label} optional error={errors[f.name]?.message}>
              <Input
                type="url"
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={f.placeholder}
                {...fieldA11y(f.name, errors[f.name]?.message)}
                {...register(f.name)}
              />
            </Field>
          ))}
        </div>
      </Group>

      <div className="border-t border-line pt-6">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function toFormValues(cafe: ReturnType<typeof useSession>["cafe"]): CafeProfileFormInput {
  return {
    name: cafe.name,
    slug: cafe.slug,
    tagline: cafe.tagline,
    address: cafe.address,
    phone: cafe.phone,
    currency: cafe.currency,
    logo: cafe.logo,
    notices: cafe.notices.join("\n"),
    instagram: cafe.instagram,
    facebook: cafe.facebook,
    zomato: cafe.zomato,
    swiggy: cafe.swiggy,
  };
}

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-6">
      <div>
        <legend className="font-mono text-xs tracking-[0.18em] text-muted uppercase">{title}</legend>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function LogoField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (logo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const shownError = uploadError ?? error;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setProcessing(true);
    try {
      onChange(await resizeImage(file));
    } catch (e) {
      setUploadError(getErrorMessage(e));
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">
        Logo <span className="ml-1.5 font-normal text-muted">optional</span>
      </p>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface">
          {value ? (
            <Image src={value} alt="Your logo" width={64} height={64} unoptimized className="size-full object-contain" />
          ) : (
            <span className="text-xs text-muted">None</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" loading={processing} onClick={() => inputRef.current?.click()}>
            {value ? "Replace" : "Upload logo"}
          </Button>
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange("")}>
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload logo"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {shownError ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {shownError}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">Square images look best. Shown at the top of your menu.</p>
      )}
    </div>
  );
}
