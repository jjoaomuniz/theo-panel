/** Parse and clamp an integer query parameter between min and max */
export function parseIntParam(value: unknown, defaultVal: number, min: number, max: number): number {
  if (value === undefined || value === null || value === '') return defaultVal;
  const parsed = parseInt(String(value), 10);
  if (isNaN(parsed)) return defaultVal;
  return Math.min(Math.max(parsed, min), max);
}

/** Validate that a string is alphanumeric + hyphens (safe ID) */
export function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value);
}

/** Standard API error response shape */
export interface ApiError {
  error: string;
  code: string;
}

export function errorResponse(error: string, code: string): ApiError {
  return { error, code };
}
