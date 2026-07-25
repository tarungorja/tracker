import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Minimal react-hook-form resolver for Zod (avoids the @hookform/resolvers
 * dependency, which pulls in conflicting peer deps).
 */
export function zodResolver<T extends FieldValues>(
  schema: ZodType<T>,
): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "root";
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return {
      values: {},
      // Cast: RHF's error map is structurally compatible with our flat map.
      errors: errors as never,
    };
  };
}
