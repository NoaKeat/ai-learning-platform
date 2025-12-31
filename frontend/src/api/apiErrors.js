// src/api/apiErrors.js

export function isUnexpectedError(err) {
  const s = err?.status ?? 0;
  // status=0 => network / fetch failed
  // 5xx => server fault
  return s === 0 || s >= 500;
}

export function getTraceId(err) {
  // Prefer normalized field, fallback to raw ProblemDetails
  return err?.traceId || err?.data?.extensions?.traceId || null;
}

// Optional helpers (useful for “expected” handling)
export function isValidationError(err) {
  return (err?.status === 400 && err?.code === "VALIDATION_ERROR");
}

export function getValidationFieldErrors(err) {
  // supports both:
  // details: { errors: { phone: [".."] } }
  // OR details: { phone: [".."] }
  const d = err?.details;
  const errors = d?.errors ?? d;
  return errors && typeof errors === "object" ? errors : null;
}
