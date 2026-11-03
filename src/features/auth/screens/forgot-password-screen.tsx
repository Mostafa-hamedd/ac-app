import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DEFAULT_COUNTRY_VALUE } from '@/lib/phone/phone-country';
import { Button } from '@/shared/ui/button';
import { PhoneField } from '@/shared/ui/phone-field';
import { Screen } from '@/shared/ui/screen';

import { AuthHeader } from '../components/auth-header';
import { FormError } from '../components/form-error';
import { useRequestPasswordReset } from '../hooks/use-auth-mutations';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth.schemas';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const request = useRequestPasswordReset();
  const { control, handleSubmit, setValue, clearErrors } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { country: DEFAULT_COUNTRY_VALUE, phone: '' },
  });
  const selectedCountry = useWatch({ control, name: 'country' });

  const onSubmit = handleSubmit((values) => {
    request.mutate(values, {
      onSuccess: ({ resetId }) => {
        router.push({
          pathname: '/verify-otp',
          params: {
            purpose: 'reset-password',
            id: resetId,
            phone: values.phone,
            country: values.country,
          },
        });
      },
    });
  });

  return (
    <Screen preset="keyboard" edges={['top', 'bottom']} contentClassName="px-6 pt-3">
      <AuthHeader title={t('forgotPassword.title')} subtitle={t('forgotPassword.subtitle')} />

      <View className="gap-5">
        <FormError error={request.error} />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <PhoneField
              country={selectedCountry}
              onCountryChange={(country) => {
                setValue('country', country);
                clearErrors('phone');
              }}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              onSubmitEditing={() => onSubmit()}
            />
          )}
        />
      </View>

      <Button className="mt-6" onPress={() => onSubmit()} loading={request.isPending}>
        {t('forgotPassword.submit')}
      </Button>
    </Screen>
  );
}
