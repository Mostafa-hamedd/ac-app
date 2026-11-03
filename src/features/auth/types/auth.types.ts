import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  /** National number without '+' or dial code. The login identifier (see loginSchema). */
  phone: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: userSchema,
});

/** Identity documents collected during registration. */
const kycDocumentTypeSchema = z.enum([
  'national_id_front',
  'drivers_license_front',
  'car_registration_front',
  'car_registration_back',
]);

export const kycDocumentSchema = z.object({
  type: kycDocumentTypeSchema,
  uri: z.string(),
  uploadedAt: isoDateSchema,
});

/** An in-progress registration, kept by the server and addressed by its id. */
export const registrationDraftSchema = z.object({
  registrationId: z.string(),
  /** Country code from the phone country list, e.g. 'EG'. */
  country: z.string(),
  phone: z.string(),
  email: z.string(),
  otpVerified: z.boolean(),
  documents: z.partialRecord(kycDocumentTypeSchema, kycDocumentSchema),
});

/**
 * Result of submitting a registration. 'failed' is a business answer ("car not
 * registered"), not an error, so the screen branches on it instead of on isError.
 */
export const registrationOutcomeSchema = z.enum(['verified', 'failed']);

export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type KycDocumentType = z.infer<typeof kycDocumentTypeSchema>;
export type KycDocument = z.infer<typeof kycDocumentSchema>;
export type RegistrationDraft = z.infer<typeof registrationDraftSchema>;
export type RegistrationOutcome = z.infer<typeof registrationOutcomeSchema>;

export type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated';

export type KycUploadInput = {
  registrationId: string;
  type: KycDocumentType;
  uri: string;
  mimeType?: string;
  fileName?: string;
};
