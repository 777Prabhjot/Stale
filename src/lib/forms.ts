import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { getErrorMessage, isAppError } from "./errors";

/**
 * Routes a service error into a form: field-level messages go onto their inputs,
 * anything else is returned as a form-level message to show in an <Alert>.
 */
export function handleFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  if (isAppError(error) && error.fieldErrors) {
    let unmatched = false;
    let focused = false;
    for (const [key, message] of Object.entries(error.fieldErrors)) {
      if ((fields as readonly string[]).includes(key)) {
        setError(key as Path<T>, { type: "server", message }, { shouldFocus: !focused });
        focused = true;
      } else {
        unmatched = true;
      }
    }
    return unmatched ? error.message : null;
  }
  return getErrorMessage(error);
}
