import { z } from 'zod';

import { i18n } from '@/lib/i18n';
import {
  DEFAULT_COUNTRY_VALUE,
  getCountry,
  getCountryName,
  isValidPhoneLength,
} from '@/lib/phone/phone-country';

// Messages are functions so they use the language active when validation runs.
const email = z
  .string()
  .trim()
  .min(1, { error: () => i18n.t('validation.emailRequired') })
  .pipe(z.email({ error: () => i18n.t('validation.emailInvalid') }));

/** The national number, without the dial code of the selected `country`. */
const phone = z
  .string()
  .trim()
  .min(1, { error: () => i18n.t('validation.phoneRequired') });

/** 10 digits after +20, covering Egypt's 010/011/012/015 mobile prefixes. */
const EGYPT_MOBILE = /^1[0125]\d{8}$/;

function isValidPhone(countryValue: string, value: string) {
  if (countryValue === DEFAULT_COUNTRY_VALUE) return EGYPT_MOBILE.test(value);
  return /^\d+$/.test(value) && isValidPhoneLength(getCountry(countryValue), value.length);
}

/** Validates `phone` against the selected country; an empty one is already reported by `phone`. */
function refinePhone(values: { country: string; phone: string }, ctx: z.RefinementCtx) {
  if (!values.phone || isValidPhone(values.country, values.phone)) return;
  ctx.addIssue({
    code: 'custom',
    path: ['phone'],
    message:
      values.country === DEFAULT_COUNTRY_VALUE
        ? i18n.t('validation.phoneInvalidEgypt')
        : i18n.t('validation.phoneInvalidCountry', {
            country: getCountryName(getCountry(values.country), i18n.language),
          }),
  });
}

const password = z.string().min(8, { error: () => i18n.t('validation.passwordTooShort') });

export const loginSchema = z
  .object({
    country: z.string(),
    phone,
    password: z.string().min(1, { error: () => i18n.t('validation.passwordRequired') }),
  })
  .superRefine(refinePhone);
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z
  .object({ country: z.string(), phone })
  .superRefine(refinePhone);
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z
  .object({
    country: z.string(),
    phone,
    email,
    password,
  })
  .superRefine(refinePhone);
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z.string().length(4, { error: () => i18n.t('validation.otpLength') }),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

// Asks for the new password twice so a typo can't lock the user out.
export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: () => i18n.t('validation.passwordsDontMatch'),
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
