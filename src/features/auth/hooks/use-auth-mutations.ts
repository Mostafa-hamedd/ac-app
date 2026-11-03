import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@/lib/auth/session-storage';

import * as authApi from '../api/auth.api';
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '../schemas/auth.schemas';
import { useSessionStore } from '../store/session-store';
import type { KycUploadInput } from '../types/auth.types';

import { registrationDraftKey } from './use-registration-draft';
import { endSession } from './use-session';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: async ({ accessToken, refreshToken, user }) => {
      await tokenStorage.save({ accessToken, refreshToken });
      // A different account may have used this device: never reuse its cache.
      queryClient.clear();
      useSessionStore.getState().setAuthenticated(user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        // Sign out locally even if the server call fails.
        await endSession(queryClient);
      }
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: ({ phone, country }: ForgotPasswordFormValues) =>
      authApi.requestPasswordReset(phone, country),
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: (input: { resetId: string; code: string }) => authApi.verifyResetOtp(input),
  });
}

export function useResendResetOtp() {
  return useMutation({
    mutationFn: (input: { resetId: string }) => authApi.resendResetOtp(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { resetToken: string; password: string }) => authApi.resetPassword(input),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
  });
}

export function useVerifyRegistrationOtp() {
  return useMutation({
    mutationFn: (input: { registrationId: string; code: string }) =>
      authApi.verifyRegistrationOtp(input),
  });
}

export function useResendRegistrationOtp() {
  return useMutation({
    mutationFn: (input: { registrationId: string }) => authApi.resendRegistrationOtp(input),
  });
}

export function useUploadKycDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KycUploadInput) => authApi.uploadKycDocument(input),
    onSuccess: (_document, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationDraftKey(variables.registrationId) });
    },
  });
}

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: (input: { registrationId: string }) => authApi.submitRegistration(input),
  });
}
