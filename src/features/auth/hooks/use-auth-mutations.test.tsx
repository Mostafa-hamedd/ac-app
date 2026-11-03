import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/lib/api/api-error';
import { createQueryWrapper } from '@tests/helpers/render-with-providers';

import * as authApi from '../api/auth.api';
import { useSessionStore } from '../store/session-store';
import type { User } from '../types/auth.types';

import { useLogin, useLogout, useSubmitRegistration } from './use-auth-mutations';

jest.mock('../api/auth.api');

const user: User = {
  id: 'USR_1',
  name: 'Jordan Reyes',
  email: 'driver@example.com',
  phone: '1069004342',
};

beforeEach(() => {
  useSessionStore.getState().setUnauthenticated();
});

describe('useLogin', () => {
  it('stores the session and marks the user authenticated on success', async () => {
    jest
      .mocked(authApi.login)
      .mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh', user });

    const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });
    result.current.mutate({ country: 'EG', phone: '1069004342', password: 'secret' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().user).toEqual(user);
  });

  it('surfaces the error and leaves the session unauthenticated on failure', async () => {
    jest
      .mocked(authApi.login)
      .mockRejectedValue(new ApiError('unauthorized', 'Incorrect phone number or password.'));

    const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });
    result.current.mutate({ country: 'EG', phone: '1069004342', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ kind: 'unauthorized' });
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});

describe('useLogout', () => {
  it('clears the session on a normal logout', async () => {
    useSessionStore.getState().setAuthenticated(user);
    jest.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = await renderHook(() => useLogout(), { wrapper: createQueryWrapper() });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });

  it('clears the session locally even if the server call fails', async () => {
    useSessionStore.getState().setAuthenticated(user);
    jest.mocked(authApi.logout).mockRejectedValue(new Error('network down'));

    const { result } = await renderHook(() => useLogout(), { wrapper: createQueryWrapper() });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});

describe('useSubmitRegistration', () => {
  it('surfaces a failed outcome as mutation data, not an error', async () => {
    jest.mocked(authApi.submitRegistration).mockResolvedValue({ outcome: 'failed' });

    const { result } = await renderHook(() => useSubmitRegistration(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate({ registrationId: 'REG_1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual({ outcome: 'failed' });
  });
});
