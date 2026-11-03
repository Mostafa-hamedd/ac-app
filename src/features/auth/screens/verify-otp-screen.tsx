import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { formatDialCode, getCountry } from '@/lib/phone/phone-country';
import { Button } from '@/shared/ui/button';
import { OtpInput } from '@/shared/ui/otp-input';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { AuthHeader } from '../components/auth-header';
import { FormError } from '../components/form-error';
import {
  useResendRegistrationOtp,
  useResendResetOtp,
  useVerifyRegistrationOtp,
  useVerifyResetOtp,
} from '../hooks/use-auth-mutations';
import { otpSchema, type OtpFormValues } from '../schemas/auth.schemas';

const RESEND_SECONDS = 59;

/** Keeps numbers like "+20 10…" or "00:59" left-to-right inside an Arabic sentence. */
const leftToRight = (text: string) => `⁦${text}⁩`;

export type VerifyOtpScreenProps = {
  purpose: 'register' | 'reset-password';
  id: string;
  phone: string;
  country?: string;
};

/** The code step for both registration and password reset. */
export function VerifyOtpScreen({ purpose, id, phone, country }: VerifyOtpScreenProps) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const verifyRegistration = useVerifyRegistrationOtp();
  const verifyReset = useVerifyResetOtp();
  const resendRegistration = useResendRegistrationOtp();
  const resendReset = useResendResetOtp();
  const verifying = purpose === 'register' ? verifyRegistration : verifyReset;
  const resending = purpose === 'register' ? resendRegistration : resendReset;

  const { control, handleSubmit, setValue } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = handleSubmit((values) => {
    if (purpose === 'register') {
      verifyRegistration.mutate(
        { registrationId: id, code: values.code },
        {
          onSuccess: () =>
            router.push({ pathname: '/upload-documents', params: { registrationId: id } }),
        },
      );
    } else {
      verifyReset.mutate(
        { resetId: id, code: values.code },
        {
          onSuccess: ({ resetToken }) =>
            router.replace({ pathname: '/reset-password', params: { resetToken } }),
        },
      );
    }
  });

  // Restart the countdown only once a new code was really sent; on failure the
  // resend link stays available and the error is shown.
  const restartCountdown = () => setSecondsLeft(RESEND_SECONDS);

  function handleResend() {
    if (purpose === 'register') {
      resendRegistration.mutate({ registrationId: id }, { onSuccess: restartCountdown });
    } else {
      resendReset.mutate({ resetId: id }, { onSuccess: restartCountdown });
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <Screen preset="keyboard" edges={['top', 'bottom']} contentClassName="px-6 pt-3">
      <AuthHeader
        title={t('verifyOtp.title')}
        subtitle={t('verifyOtp.subtitle', {
          phone: leftToRight(`${formatDialCode(getCountry(country))} ${phone}`),
        })}
      />

      <View className="gap-8">
        <FormError error={verifying.error ?? resending.error} />
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              onComplete={(code) => {
                setValue('code', code);
                if (!verifying.isPending) onSubmit();
              }}
            />
          )}
        />
        <Button onPress={() => onSubmit()} loading={verifying.isPending}>
          {t('verifyOtp.submit')}
        </Button>
      </View>

      {secondsLeft > 0 ? (
        <Text className="mt-7 text-center">
          {t('verifyOtp.resendIn', { time: leftToRight(`${minutes}:${seconds}`) })}
        </Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={resending.isPending}
          onPress={handleResend}
          className="mt-7 items-center">
          <Text variant="link">{t('verifyOtp.resend')}</Text>
        </Pressable>
      )}
    </Screen>
  );
}
