import { AppError, type AppErrorCode, type FieldErrors } from "./errors";

/*
 * Thin fetch wrapper for the Slate API. Calls go to /api/* on this site (Next.js forwards them to
 * the API server), so the session cookie is sent automatically. Every failure becomes an AppError,
 * the same type the API uses, so forms and toasts can handle errors in one way.
 */

type ApiErrorBody = { error?: { code?: AppErrorCode; message?: string; fieldErrors?: FieldErrors } };

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (cause) {
    throw new AppError("NETWORK", "Can't reach Slate. Check your internet connection and try again.", { cause });
  }

  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);
  if (response.ok) return data as T;

  const error = (data as ApiErrorBody | null)?.error;
  if (error?.code && error.message) {
    throw new AppError(error.code, error.message, { fieldErrors: error.fieldErrors });
  }
  // Not one of our JSON errors: usually the API server is down and the proxy answered instead.
  throw new AppError(
    response.status >= 500 ? "NETWORK" : "UNKNOWN",
    response.status >= 500
      ? "Slate's server isn't responding. Try again in a moment."
      : `Something went wrong (error ${response.status}). Try again.`,
  );
}
