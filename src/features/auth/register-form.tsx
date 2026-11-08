"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { Input, PasswordInput, PhoneInput, PrefixInput } from "@/components/ui/input";
import { routes } from "@/lib/config";
import { handleFormError } from "@/lib/forms";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { slugify } from "@/lib/utils";
import { useAuth } from "./auth-provider";

const FIELDS = ["ownerName", "phone", "password", "confirmPassword", "cafeName", "slug"] as const;

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ownerName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      cafeName: "",
      slug: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(values);
      router.replace(routes.dashboard);
    } catch (error) {
      setFormError(handleFormError(error, setError, FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert>{formError}</Alert>}

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-mono text-xs tracking-[0.18em] text-muted uppercase">Your café</legend>

        <Field id="cafeName" label="Café name" error={errors.cafeName?.message}>
          <Input
            autoComplete="organization"
            placeholder="Brew & Bloom"
            {...fieldA11y("cafeName", errors.cafeName?.message)}
            {...register("cafeName", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                // Keep suggesting a link until the owner edits it themselves.
                if (!getFieldState("slug").isDirty) setValue("slug", slugify(e.target.value));
              },
            })}
          />
        </Field>

        <Field
          id="slug"
          label="Menu link"
          hint="Customers land here when they scan your QR code."
          error={errors.slug?.message}
        >
          <PrefixInput
            prefix="/m/"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="brew-and-bloom"
            {...fieldA11y("slug", errors.slug?.message, true)}
            {...register("slug")}
          />
        </Field>
      </fieldset>

      <fieldset className="mt-3 flex flex-col gap-5">
        <legend className="mb-4 font-mono text-xs tracking-[0.18em] text-muted uppercase">Your account</legend>

        <Field id="ownerName" label="Your name" error={errors.ownerName?.message}>
          <Input autoComplete="name" {...fieldA11y("ownerName", errors.ownerName?.message)} {...register("ownerName")} />
        </Field>

        <Field
          id="phone"
          label="Mobile number"
          hint="You'll use this to sign in."
          error={errors.phone?.message}
        >
          <PhoneInput {...fieldA11y("phone", errors.phone?.message, true)} {...register("phone")} />
        </Field>

        <Field
          id="password"
          label="Password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
        >
          <PasswordInput
            autoComplete="new-password"
            {...fieldA11y("password", errors.password?.message, true)}
            {...register("password")}
          />
        </Field>

        <Field id="confirmPassword" label="Repeat password" error={errors.confirmPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            {...fieldA11y("confirmPassword", errors.confirmPassword?.message)}
            {...register("confirmPassword")}
          />
        </Field>
      </fieldset>

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Create café
      </Button>

      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href={routes.login} className="font-medium text-slate underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
