import { isAxiosError } from 'axios';
import { z } from 'zod';

import { i18n } from '@/lib/i18n';

/** Error categories the UI reacts to differently. */
export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'unknown';

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fieldErrors?: FieldErrors;

  constructor(kind: ApiErrorKind, message: string, status?: number, fieldErrors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** Worth offering a "Try again" button for. */
  get isRetryable(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'timeout' ||
      this.kind === 'server' ||
      this.kind === 'rate_limited'
    );
  }
}

/** The user-facing message for each kind, in the app's current language. */
function defaultMessage(kind: ApiErrorKind): string {
  return i18n.t(`errors.${kind}`);
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404 || status === 410) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

type ErrorBody = { message?: unknown; errors?: unknown };

function readBody(data: unknown): { message?: string; fieldErrors?: FieldErrors } {
  if (!data || typeof data !== 'object') return {};
  const body = data as ErrorBody;
  const message = typeof body.message === 'string' ? body.message : undefined;
  const fieldErrors =
    body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)
      ? (body.errors as FieldErrors)
      : undefined;
  return { message, fieldErrors };
}

/**
 * Normalizes anything thrown by the API layer into an ApiError.
 * Adjust `readBody` to match the backend's error contract.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('timeout', defaultMessage('timeout'));
    }
    if (!error.response) {
      return new ApiError('network', defaultMessage('network'));
    }
    const { status, data } = error.response;
    const kind = kindFromStatus(status);
    const { message, fieldErrors } = readBody(data);
    // Only trust server-provided copy for validation errors; other kinds use our own wording.
    const userMessage = kind === 'validation' && message ? message : defaultMessage(kind);
    return new ApiError(kind, userMessage, status, fieldErrors);
  }

  return new ApiError('unknown', defaultMessage('unknown'));
}

/**
 * Checks a response against its schema. When the backend changes a field, the screen
 * shows a normal error instead of crashing somewhere in the UI.
 */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (__DEV__) console.warn(`Unexpected API response:\n${z.prettifyError(result.error)}`);
  throw new ApiError('server', defaultMessage('server'));
}
