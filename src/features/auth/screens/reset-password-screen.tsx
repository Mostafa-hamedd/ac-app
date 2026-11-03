import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { PasswordField } from '@/shared/ui/password-field';
import { Screen } from '@/shared/ui/screen';

import { AuthHeader } from '../components/auth-header';
import { FormError } from '../components/form-error';
import { ResultCard } from '../components/result-card';
import { useResetPassword } from '../hooks/use-auth-mutations';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/auth.schemas';

export function ResetPasswordScreen({ resetToken }: { resetToken?: string }) {
  const { t } = useTranslation();
  const reset = useResetPassword();
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!resetToken) {
    return (
      <Screen>
        <EmptyState
          icon={KeyRound}
          title={t('resetPassword.invalidLinkTitle')}
          description={t('resetPassword.invalidLinkDescription')}
        />
      </Screen>
    );
  }

  if (reset.isSuccess) {
    return (
      <ResultCard
        tone="success"
        title={t('resetPassword.successTitle')}
        description={t('resetPassword.successDescription')}
        action={
          <Link href="/login" replace asChild>
            <Button>{t('resetPassword.backToSignIn')}</Button>
          </Link>
        }
      />
    );
  }

  const onSubmit = handleSubmit(({ password }) => reset.mutate({ resetToken, password }));

  return (
    <Screen preset="keyboard" edges={['top', 'bottom']} contentClassName="px-6 pt-3">
      <AuthHeader title={t('resetPassword.title')} subtitle={t('resetPassword.subtitle')} />

      <View className="gap-5">
        <FormError error={reset.error} />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              label={t('resetPassword.newPassword')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordField
              label={t('resetPassword.confirmPassword')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              onSubmitEditing={() => onSubmit()}
            />
          )}
        />
      </View>

      <Button className="mt-6" onPress={() => onSubmit()} loading={reset.isPending}>
        {t('resetPassword.submit')}
      </Button>
    </Screen>
  );
}
