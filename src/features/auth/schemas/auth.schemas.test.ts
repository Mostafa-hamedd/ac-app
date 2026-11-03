import { i18n } from '@/lib/i18n';

import { loginSchema, otpSchema, registerSchema, resetPasswordSchema } from './auth.schemas';

describe('validation message language', () => {
  afterEach(() => i18n.changeLanguage('en'));

  it('uses the language active when validation runs', async () => {
    await i18n.changeLanguage('ar');
    const result = loginSchema.safeParse({ country: 'SA', phone: '123', password: '' });
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        'كلمة المرور مطلوبة',
        'أدخل رقم موبايل صحيح لدولة المملكة العربية السعودية',
      ]),
    );
  });
});

describe('loginSchema', () => {
  it('accepts a valid Egyptian mobile number and trims it', () => {
    const result = loginSchema.parse({ country: 'EG', phone: ' 1069004342 ', password: 'secret' });
    expect(result.phone).toBe('1069004342');
  });

  it('rejects an invalid phone number and an empty password', () => {
    const result = loginSchema.safeParse({ country: 'EG', phone: 'not-a-phone', password: '' });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['phone', 'password']));
  });

  it.each([
    ['1069004342', true],
    ['1123456789', true],
    ['2069004342', false], // doesn't start with 1
    ['1369004342', false], // invalid second digit (not 0/1/2/5)
    ['106900434', false], // too short
    ['10690043421', false], // too long
  ])('validates %s as %s', (phone, expected) => {
    expect(loginSchema.safeParse({ country: 'EG', phone, password: 'x' }).success).toBe(expected);
  });

  it.each([
    ['SA', '512345678', true], // exact length
    ['SA', '51234567', false],
    ['SA', '51234567x', false], // not digits
    ['JO', '12345678', true], // list of allowed lengths
    ['JO', '1234567', false],
    ['FI', '123456789', true], // min/max range
    ['FI', '12345678', false],
    ['JP', '1234567890', true], // no length in the list: E.164 limits
    ['JP', '1234567890123456', false],
  ])('validates %s number %s as %s', (country, phone, expected) => {
    expect(loginSchema.safeParse({ country, phone, password: 'x' }).success).toBe(expected);
  });

  it('reports a wrong number for the selected country on the phone field', () => {
    const result = loginSchema.safeParse({ country: 'SA', phone: '123', password: 'x' });
    expect(result.error?.issues[0]?.path).toEqual(['phone']);
    expect(result.error?.issues[0]?.message).toContain('Saudi Arabia');
  });
});

describe('registerSchema', () => {
  it('accepts a complete registration', () => {
    const result = registerSchema.safeParse({
      country: 'EG',
      phone: '1069004342',
      email: 'driver@example.com',
      password: 'longenough',
    });
    expect(result.success).toBe(true);
  });
});

describe('otpSchema', () => {
  it('requires exactly 4 digits', () => {
    expect(otpSchema.safeParse({ code: '1234' }).success).toBe(true);
    expect(otpSchema.safeParse({ code: '123' }).success).toBe(false);
    expect(otpSchema.safeParse({ code: '12345' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('requires matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'longenough',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
