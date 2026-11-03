import { z } from 'zod';

import { parseResponse } from '@/lib/api/api-error';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schemas';
import {
  kycDocumentSchema,
  loginResponseSchema,
  registrationDraftSchema,
  registrationOutcomeSchema,
  userSchema,
  type KycDocument,
  type KycUploadInput,
  type LoginResponse,
  type RegistrationDraft,
  type RegistrationOutcome,
  type User,
} from '../types/auth.types';

export async function login(credentials: LoginFormValues): Promise<LoginResponse> {
  const { data } = await apiClient.post(endpoints.auth.login, credentials);
  return parseResponse(loginResponseSchema, data);
}

export async function logout(): Promise<void> {
  await apiClient.post(endpoints.auth.logout);
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get(endpoints.auth.me);
  return parseResponse(userSchema, data);
}

// --- Registration ---

export async function register(
  input: RegisterFormValues,
): Promise<{ registrationId: string; phone: string }> {
  const { data } = await apiClient.post(endpoints.auth.register, input);
  return parseResponse(z.object({ registrationId: z.string(), phone: z.string() }), data);
}

export async function verifyRegistrationOtp(input: {
  registrationId: string;
  code: string;
}): Promise<void> {
  await apiClient.post(endpoints.auth.verifyRegistrationOtp, input);
}

export async function resendRegistrationOtp(input: { registrationId: string }): Promise<void> {
  await apiClient.post(endpoints.auth.resendRegistrationOtp, input);
}

export async function uploadKycDocument(input: KycUploadInput): Promise<KycDocument> {
  const formData = new FormData();
  formData.append('type', input.type);
  // React Native's FormData accepts this file-descriptor shape for a picked asset.
  // Gallery photos are often HEIC or PNG, so send the picker's real type when it gives one.
  formData.append('file', {
    uri: input.uri,
    name: input.fileName ?? `${input.type}.jpg`,
    type: input.mimeType ?? 'image/jpeg',
  } as unknown as Blob);
  const { data } = await apiClient.post(
    endpoints.auth.uploadKycDocument(input.registrationId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return parseResponse(kycDocumentSchema, data);
}

export async function getRegistrationDraft(registrationId: string): Promise<RegistrationDraft> {
  const { data } = await apiClient.get(endpoints.auth.registrationDraft(registrationId));
  return parseResponse(registrationDraftSchema, data);
}

export async function submitRegistration(input: {
  registrationId: string;
}): Promise<{ outcome: RegistrationOutcome }> {
  const { data } = await apiClient.post(endpoints.auth.submitRegistration(input.registrationId));
  return parseResponse(z.object({ outcome: registrationOutcomeSchema }), data);
}

// --- Password reset ---

export async function requestPasswordReset(
  phone: string,
  country: string,
): Promise<{ resetId: string }> {
  const { data } = await apiClient.post(endpoints.auth.forgotPassword, { phone, country });
  return parseResponse(z.object({ resetId: z.string() }), data);
}

export async function verifyResetOtp(input: {
  resetId: string;
  code: string;
}): Promise<{ resetToken: string }> {
  const { data } = await apiClient.post(endpoints.auth.verifyResetOtp, input);
  return parseResponse(z.object({ resetToken: z.string() }), data);
}

export async function resendResetOtp(input: { resetId: string }): Promise<void> {
  await apiClient.post(endpoints.auth.resendResetOtp, input);
}

export async function resetPassword(input: {
  resetToken: string;
  password: string;
}): Promise<void> {
  await apiClient.post(endpoints.auth.resetPassword, input);
}
