import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_COUNTRY_VALUE } from '@/lib/phone/phone-country';
import { Button, Input } from '@/shared/ui';
import { PasswordField } from '@/shared/ui/password-field';
import { PhoneField } from '@/shared/ui/phone-field';
import { Screen } from '@/shared/ui/screen';
import { colors } from '@/theme';

import { AuthHeader } from '../components/auth-header';
import { FormError } from '../components/form-error';
import { useRegister } from '../hooks/use-auth-mutations';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schemas';

export function RegisterScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const register = useRegister();
  const { control, handleSubmit, setValue, clearErrors } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: DEFAULT_COUNTRY_VALUE, phone: '', email: '', password: '' },
  });
  const selectedCountry = useWatch({ control, name: 'country' });

  // Keep the Android status-bar fill on #F5F5F5 with the screen body.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      void SystemUI.setBackgroundColorAsync(colors.background);
    }, []),
  );

  const onSubmit = handleSubmit((values) => {
    register.mutate(values, {
      onSuccess: ({ registrationId, phone }) => {
        router.push({
          pathname: '/verify-otp',
          params: { purpose: 'register', id: registrationId, phone, country: values.country },
        });
      },
    });
  });

  return (
    <Screen
      preset="keyboard"
      edges={[]}
      contentClassName="px-6 pt-3"
      className="bg-background"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="dark" />
      <AuthHeader
        title={t('register.title')}
        subtitle={t('register.subtitle')}
        styleWrapper="mb-20"
        styleSubTitle="text-lg"
      />

      <View className="gap-5">
        <FormError error={register.error} />
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
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label={t('fields.email')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              onSubmitEditing={() => onSubmit()}
            />
          )}
        />
        <Button className="mt-6" onPress={() => onSubmit()} loading={register.isPending}>
          {t('register.submit')}
        </Button>
      </View>
    </Screen>
  );
}
