import { AxiosError, type AxiosResponse } from 'axios';

import { ApiError, toApiError } from './api-error';

function httpError(status: number, data?: unknown): AxiosError {
  const response = { status, data, headers: {}, statusText: '', config: {} } as AxiosResponse;
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, response);
}

describe('toApiError', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [422, 'validation'],
    [429, 'rate_limited'],
    [503, 'server'],
  ] as const)('maps HTTP %i to %s', (status, kind) => {
    expect(toApiError(httpError(status)).kind).toBe(kind);
  });

  it('maps a request without a response to a network error', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(toApiError(error).kind).toBe('network');
  });

  it('maps timeouts', () => {
    const error = new AxiosError('timeout', 'ECONNABORTED');
    expect(toApiError(error).kind).toBe('timeout');
  });

  it('keeps field errors from validation responses', () => {
    const error = toApiError(httpError(422, { message: 'Invalid', errors: { email: ['Taken'] } }));
    expect(error.message).toBe('Invalid');
    expect(error.fieldErrors).toEqual({ email: ['Taken'] });
  });

  it('does not surface server messages for non-validation errors', () => {
    const error = toApiError(httpError(500, { message: 'NullPointerException at …' }));
    expect(error.message).not.toContain('NullPointer');
  });

  it('passes ApiError through unchanged and wraps unknown values', () => {
    const original = new ApiError('forbidden', 'no');
    expect(toApiError(original)).toBe(original);
    expect(toApiError('boom').kind).toBe('unknown');
  });

  it('flags only recoverable errors as retryable', () => {
    expect(new ApiError('network', '').isRetryable).toBe(true);
    expect(new ApiError('forbidden', '').isRetryable).toBe(false);
  });
});
