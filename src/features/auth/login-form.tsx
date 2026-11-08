"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { PasswordInput, PhoneInput } from "@/components/ui/input";
import { DEMO_ACCOUNT, routes, siteConfig } from "@/lib/config";
import { handleFormError } from "@/lib/forms";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { useAuth } from "./auth-provider";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      router.replace(routes.dashboard);
    } catch (error) {
      setFormError(handleFormError(error, setError, ["phone", "password"]));
    }
  });

  function fillDemo() {
    setValue("phone", DEMO_ACCOUNT.phone, { shouldValidate: true });
    setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert>{formError}</Alert>}

      <Field id="phone" label="Mobile number" error={errors.phone?.message}>
        <PhoneInput {...fieldA11y("phone", errors.phone?.message)} {...register("phone")} />
      </Field>

      <Field id="password" label="Password" error={errors.password?.message}>
        <PasswordInput
          autoComplete="current-password"
          {...fieldA11y("password", errors.password?.message)}
          {...register("password")}
        />
      </Field>

      <Button type="submit" loading={isSubmitting} className="mt-1">
        Sign in
      </Button>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={routes.register} className="font-medium text-slate underline-offset-4 hover:underline">
          Register your café
        </Link>
      </p>

      {/* Development only: the demo owner comes from the API's seed (npm run db:seed). */}
      {siteConfig.showDemoLogin && (
        <button
          type="button"
          onClick={fillDemo}
          className="mx-auto rounded-full px-3 py-1 text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          Use the demo account
        </button>
      )}
    </form>
  );
}
