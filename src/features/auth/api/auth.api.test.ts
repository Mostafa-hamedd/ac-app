import {
  getCurrentUser,
  getRegistrationDraft,
  login,
  logout,
  register,
  requestPasswordReset,
  resendRegistrationOtp,
  resendResetOtp,
  resetPassword,
  submitRegistration,
  uploadKycDocument,
  verifyRegistrationOtp,
  verifyResetOtp,
} from './auth.api';

import { MOCK_FAIL_VERIFICATION_PHONE, MOCK_USER } from '@/mocks/auth';

const REGISTER_INPUT = {
  country: 'EG',
  phone: '1069004342',
  email: 'someone@example.com',
  password: 'longenough',
};

const ALL_DOCUMENT_TYPES = [
  'national_id_front',
  'drivers_license_front',
  'car_registration_front',
  'car_registration_back',
] as const;

describe('login', () => {
  it('succeeds for any phone/password and returns the demo user', async () => {
    const result = await login({ country: 'EG', phone: '1069004342', password: 'anything' });
    expect(result.user).toEqual(MOCK_USER);
    expect(result.accessToken).toBeTruthy();
  });

  it('simulates invalid credentials for the "fail" sentinel password', async () => {
    await expect(
      login({ country: 'EG', phone: '1069004342', password: 'fail' }),
    ).rejects.toMatchObject({
      kind: 'unauthorized',
    });
  });

  it('simulates a server error for the "error" sentinel password', async () => {
    await expect(
      login({ country: 'EG', phone: '1069004342', password: 'error' }),
    ).rejects.toMatchObject({
      kind: 'server',
    });
  });
});

describe('logout', () => {
  it('resolves', async () => {
    await expect(logout()).resolves.toBeUndefined();
  });
});

describe('getCurrentUser', () => {
  it('returns the demo user', async () => {
    await expect(getCurrentUser()).resolves.toEqual(MOCK_USER);
  });
});

describe('registration flow', () => {
  it('registers and returns a registrationId addressing a fresh draft', async () => {
    const { registrationId, phone } = await register(REGISTER_INPUT);
    expect(registrationId).toBeTruthy();
    expect(phone).toBe(REGISTER_INPUT.phone);

    const draft = await getRegistrationDraft(registrationId);
    expect(draft).toMatchObject({ registrationId, phone, otpVerified: false });
    expect(draft.documents).toEqual({});
  });

  it('verifies OTP 1234, rejects other codes, and simulates a server error for 0000', async () => {
    const { registrationId } = await register(REGISTER_INPUT);

    await expect(verifyRegistrationOtp({ registrationId, code: '0000' })).rejects.toMatchObject({
      kind: 'server',
    });
    await expect(verifyRegistrationOtp({ registrationId, code: '9999' })).rejects.toMatchObject({
      kind: 'validation',
    });
    await expect(verifyRegistrationOtp({ registrationId, code: '1234' })).resolves.toBeUndefined();

    const draft = await getRegistrationDraft(registrationId);
    expect(draft.otpVerified).toBe(true);
  });

  it('answers not_found for an unknown registrationId', async () => {
    await expect(resendRegistrationOtp({ registrationId: 'nope' })).rejects.toMatchObject({
      kind: 'not_found',
    });
  });

  it('tracks uploaded KYC documents on the draft', async () => {
    const { registrationId } = await register(REGISTER_INPUT);
    await uploadKycDocument({ registrationId, type: 'national_id_front', uri: 'file://a.jpg' });

    const draft = await getRegistrationDraft(registrationId);
    expect(draft.documents.national_id_front).toMatchObject({ uri: 'file://a.jpg' });
    expect(draft.documents.drivers_license_front).toBeUndefined();
  });

  it('rejects submission until all 4 documents are uploaded', async () => {
    const { registrationId } = await register(REGISTER_INPUT);
    await expect(submitRegistration({ registrationId })).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it('resolves a verified outcome once all documents are uploaded', async () => {
    const { registrationId } = await register(REGISTER_INPUT);
    for (const type of ALL_DOCUMENT_TYPES) {
      await uploadKycDocument({ registrationId, type, uri: `file://${type}.jpg` });
    }
    await expect(submitRegistration({ registrationId })).resolves.toEqual({ outcome: 'verified' });
  });

  it('resolves a failed outcome (not a rejection) for the sentinel phone', async () => {
    const { registrationId } = await register({
      ...REGISTER_INPUT,
      phone: MOCK_FAIL_VERIFICATION_PHONE,
    });
    for (const type of ALL_DOCUMENT_TYPES) {
      await uploadKycDocument({ registrationId, type, uri: `file://${type}.jpg` });
    }
    await expect(submitRegistration({ registrationId })).resolves.toEqual({ outcome: 'failed' });
  });
});

describe('password reset flow', () => {
  it('always succeeds, like a real backend that never reveals account existence', async () => {
    const result = await requestPasswordReset('1069004342', 'EG');
    expect(result.resetId).toBeTruthy();
  });

  it('verifies OTP 1234 and returns a resetToken, rejects other codes', async () => {
    const { resetId } = await requestPasswordReset('1069004342', 'EG');

    await expect(verifyResetOtp({ resetId, code: '9999' })).rejects.toMatchObject({
      kind: 'validation',
    });
    await expect(verifyResetOtp({ resetId, code: '1234' })).resolves.toMatchObject({
      resetToken: expect.any(String),
    });
  });

  it('resend rejects for an unknown resetId', async () => {
    await expect(resendResetOtp({ resetId: 'nope' })).rejects.toMatchObject({
      kind: 'not_found',
    });
  });

  it('resetPassword rejects an empty token and accepts a real one', async () => {
    await expect(resetPassword({ resetToken: '', password: 'newpassword' })).rejects.toMatchObject({
      kind: 'validation',
    });

    await expect(
      resetPassword({ resetToken: 'mock-reset-token-RESET_1', password: 'newpassword' }),
    ).resolves.toBeUndefined();
  });
});
