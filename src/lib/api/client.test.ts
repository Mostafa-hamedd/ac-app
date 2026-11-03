import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { authEvents } from '@/lib/auth/auth-events';
import { tokenStorage } from '@/lib/auth/session-storage';

import { ApiError } from './api-error';
import { apiClient } from './client';

function respondWith401() {
  apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const response = {
      status: 401,
      data: {},
      headers: {},
      statusText: '',
      config,
    } as AxiosResponse;
    throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, undefined, response);
  };
}

describe('apiClient 401 handling', () => {
  afterEach(async () => {
    await tokenStorage.clear();
  });

  it('reports wrong credentials when signed out', async () => {
    respondWith401();
    const onExpired = jest.fn();
    const unsubscribe = authEvents.on('session-expired', onExpired);

    const error = await apiClient.post('/auth/login').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe('Incorrect phone number or password.');
    expect(onExpired).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('ends the session when signed in', async () => {
    await tokenStorage.save({ accessToken: 'token' });
    respondWith401();
    const onExpired = jest.fn();
    const unsubscribe = authEvents.on('session-expired', onExpired);

    const error = await apiClient.get('/requests').catch((e: unknown) => e);

    expect((error as ApiError).kind).toBe('unauthorized');
    expect(onExpired).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
