import { create } from 'axios';

import { env } from '@/config/env';
import { authEvents } from '@/lib/auth/auth-events';
import { tokenStorage } from '@/lib/auth/session-storage';
import { i18n } from '@/lib/i18n';

import { ApiError, toApiError } from './api-error';

export const apiClient = create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Lets the backend answer validation errors in the user's language.
  config.headers['Accept-Language'] = i18n.language;
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.kind !== 'unauthorized') return Promise.reject(apiError);

    // Signed out, a 401 can only come from login: the credentials were wrong.
    if (!tokenStorage.getAccessToken()) {
      return Promise.reject(
        new ApiError('unauthorized', i18n.t('errors.invalidCredentials'), apiError.status),
      );
    }

    // TODO(auth): try the refresh token here once the backend defines the refresh flow.
    // Guard it so a failing refresh can never loop. Never log headers or bodies.
    authEvents.emit('session-expired');
    return Promise.reject(apiError);
  },
);
