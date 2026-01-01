// src/api/apiErrors.js

export function createApiError({
  status = 0,
  code = null,
  message = "Request failed",
  details = null,
  traceId = null,
  data = null,
  unexpected = undefined,
} = {}) {
  const err = new Error(message);

  // normalized fields used across the app
  err.status = status;
  err.code = code;
  err.message = message;
  err.details = details;
  err.traceId = traceId;

  // raw payload (ProblemDetails / custom)
  err.data = data;

  // optional flag (not required by your current isUnexpectedError)
  if (unexpected !== undefined) err.unexpected = unexpected;

  return err;
}

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
  return err?.status === 400 && err?.code === "VALIDATION_ERROR";
}

export function getValidationFieldErrors(err) {
  // supports both:
  // details: { errors: { phone: [".."] } }
  // OR details: { phone: [".."] }
  const d = err?.details;
  const errors = d?.errors ?? d;
  return errors && typeof errors === "object" ? errors : null;
}
