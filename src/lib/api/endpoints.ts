/**
 * Every backend path in one place.
 * Path params are always encoded; route params are untrusted input.
 */
const id = (value: string) => encodeURIComponent(value);

export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    register: '/auth/register',
    verifyRegistrationOtp: '/auth/register/verify-otp',
    resendRegistrationOtp: '/auth/register/resend-otp',
    registrationDraft: (registrationId: string) => `/auth/register/${id(registrationId)}`,
    uploadKycDocument: (registrationId: string) => `/auth/register/${id(registrationId)}/documents`,
    submitRegistration: (registrationId: string) => `/auth/register/${id(registrationId)}/submit`,
    forgotPassword: '/auth/forgot-password',
    verifyResetOtp: '/auth/forgot-password/verify-otp',
    resendResetOtp: '/auth/forgot-password/resend-otp',
    resetPassword: '/auth/reset-password',
  },
  requests: {
    list: '/requests',
    detail: (requestId: string) => `/requests/${id(requestId)}`,
  },
  vehicles: {
    list: '/vehicles',
    detail: (vehicleId: string) => `/vehicles/${id(vehicleId)}`,
  },
  payments: {
    list: '/payments',
    detail: (paymentId: string) => `/payments/${id(paymentId)}`,
  },
  notifications: {
    list: '/notifications',
    detail: (notificationId: string) => `/notifications/${id(notificationId)}`,
    pushTokens: '/notifications/push-tokens',
  },
} as const;
