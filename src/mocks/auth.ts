import type { KycDocumentType, RegistrationDraft, User } from '@/features/auth';

import { formPart, MockHttpError, type MockRoute } from './server';

/**
 * Fake auth backend. Any phone and password signs in as MOCK_USER, except:
 * - password 'fail' → wrong credentials, password 'error' → server error
 * - OTP code is always 1234; 0000 → server error
 * - registering with MOCK_FAIL_VERIFICATION_PHONE → verification fails ("car not registered")
 */
export const MOCK_USER: User = {
  id: 'USR_1',
  name: 'Jordan Reyes',
  email: 'driver@example.com',
  phone: '1069004342',
};

export const MOCK_FAIL_VERIFICATION_PHONE = '1000000000';

const MOCK_OTP = '1234';
const OTP_SERVER_ERROR = '0000';

const ALL_DOCUMENT_TYPES: KycDocumentType[] = [
  'national_id_front',
  'drivers_license_front',
  'car_registration_front',
  'car_registration_back',
];

const registrations = new Map<string, RegistrationDraft>();
const resets = new Map<string, { phone: string }>();

type Body = Record<string, string>;

function checkOtp(code: string) {
  if (code === OTP_SERVER_ERROR) throw new MockHttpError(500, 'Simulated server error.');
  if (code !== MOCK_OTP) throw new MockHttpError(422, 'Incorrect code.');
}

function findRegistration(id: string | undefined): RegistrationDraft {
  const draft = id ? registrations.get(id) : undefined;
  if (!draft) throw new MockHttpError(404, 'Registration not found.');
  return draft;
}

function findReset(id: string | undefined) {
  const reset = id ? resets.get(id) : undefined;
  if (!reset) throw new MockHttpError(404, 'Reset request not found.');
  return reset;
}

export const authRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/auth/login',
    handle: ({ body }) => {
      const { password } = body as Body;
      if (password === 'error') throw new MockHttpError(500, 'Simulated server error.');
      if (password === 'fail') throw new MockHttpError(401, 'Incorrect phone number or password.');
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: MOCK_USER,
      };
    },
  },
  { method: 'POST', path: '/auth/logout', handle: () => null },
  { method: 'GET', path: '/auth/me', handle: () => MOCK_USER },

  // Registration
  {
    method: 'POST',
    path: '/auth/register',
    handle: ({ body }) => {
      const { country, phone, email } = body as Body;
      const registrationId = `REG_${registrations.size + 1}`;
      registrations.set(registrationId, {
        registrationId,
        country: country!,
        phone: phone!,
        email: email!,
        otpVerified: false,
        documents: {},
      });
      return { registrationId, phone };
    },
  },
  {
    method: 'POST',
    path: '/auth/register/verify-otp',
    handle: ({ body }) => {
      const { registrationId, code } = body as Body;
      const draft = findRegistration(registrationId);
      checkOtp(code!);
      draft.otpVerified = true;
      return null;
    },
  },
  {
    method: 'POST',
    path: '/auth/register/resend-otp',
    handle: ({ body }) => {
      findRegistration((body as Body).registrationId);
      return null;
    },
  },
  {
    method: 'GET',
    path: '/auth/register/:id',
    handle: ({ params }) => findRegistration(params.id),
  },
  {
    method: 'POST',
    path: '/auth/register/:id/documents',
    handle: ({ params, body }) => {
      const draft = findRegistration(params.id);
      const type = formPart(body, 'type')?.string as KycDocumentType;
      const document = {
        type,
        uri: formPart(body, 'file')?.uri ?? '',
        uploadedAt: new Date().toISOString(),
      };
      draft.documents[type] = document;
      return document;
    },
  },
  {
    method: 'POST',
    path: '/auth/register/:id/submit',
    handle: ({ params }) => {
      const draft = findRegistration(params.id);
      if (!ALL_DOCUMENT_TYPES.every((type) => draft.documents[type])) {
        throw new MockHttpError(422, 'Please upload all required documents.');
      }
      return { outcome: draft.phone === MOCK_FAIL_VERIFICATION_PHONE ? 'failed' : 'verified' };
    },
  },

  // Password reset
  {
    method: 'POST',
    path: '/auth/forgot-password',
    handle: ({ body }) => {
      const resetId = `RESET_${resets.size + 1}`;
      resets.set(resetId, { phone: (body as Body).phone! });
      return { resetId };
    },
  },
  {
    method: 'POST',
    path: '/auth/forgot-password/verify-otp',
    handle: ({ body }) => {
      const { resetId, code } = body as Body;
      findReset(resetId);
      checkOtp(code!);
      return { resetToken: `mock-reset-token-${resetId}` };
    },
  },
  {
    method: 'POST',
    path: '/auth/forgot-password/resend-otp',
    handle: ({ body }) => {
      findReset((body as Body).resetId);
      return null;
    },
  },
  {
    method: 'POST',
    path: '/auth/reset-password',
    handle: ({ body }) => {
      if (!(body as Body).resetToken) {
        throw new MockHttpError(422, 'This reset link has expired. Request a new one.');
      }
      return null;
    },
  },
];
