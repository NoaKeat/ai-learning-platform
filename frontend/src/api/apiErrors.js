
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

  err.status = status;
  err.code = code;
  err.message = message;
  err.details = details;
  err.traceId = traceId;

  err.data = data;

  if (unexpected !== undefined) err.unexpected = unexpected;

  return err;
}

export function isUnexpectedError(err) {
  const s = err?.status ?? 0;
  return s === 0 || s >= 500;
}

export function getTraceId(err) {
  return err?.traceId || err?.data?.extensions?.traceId || null;
}

export function isValidationError(err) {
  return err?.status === 400 && err?.code === "VALIDATION_ERROR";
}

export function getValidationFieldErrors(err) {
  const d = err?.details;
  const errors = d?.errors ?? d;
  return errors && typeof errors === "object" ? errors : null;
}
