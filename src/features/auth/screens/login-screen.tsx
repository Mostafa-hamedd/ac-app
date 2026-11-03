import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { DEFAULT_COUNTRY_VALUE } from '@/lib/phone/phone-country';
import { Button } from '@/shared/ui/button';
import { PasswordField } from '@/shared/ui/password-field';
import { PhoneField } from '@/shared/ui/phone-field';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { AuthHeader } from '../components/auth-header';
import { FormError } from '../components/form-error';
import { useLogin } from '../hooks/use-auth-mutations';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

export function LoginScreen({
  initialPhone,
  initialCountry,
}: {
  initialPhone?: string;
  initialCountry?: string;
}) {
  const { t } = useTranslation();
  const login = useLogin();
  const { control, handleSubmit, setValue, clearErrors } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      country: initialCountry ?? DEFAULT_COUNTRY_VALUE,
      phone: initialPhone ?? '',
      password: '',
    },
  });
  const selectedCountry = useWatch({ control, name: 'country' });

  // No navigation here: the root layout switches to the signed-in screens when the
  // session changes, and resumes a pending deep link there.
  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <Screen preset="keyboard" edges={['top', 'bottom']} contentClassName="px-6 pt-3">
      <AuthHeader title={t('login.title')} />

      <View className="gap-5">
        <FormError error={login.error} />
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
      </View>

      <Link href="/forgot-password" asChild>
        <Pressable accessibilityRole="link" hitSlop={8} className="mt-5 self-end">
          <Text variant="link" className="text-xs underline">
            {t('login.forgotPassword')}
          </Text>
        </Pressable>
      </Link>

      <Button className="mt-6" onPress={() => onSubmit()} loading={login.isPending}>
        {t('login.submit')}
      </Button>
    </Screen>
  );
}
