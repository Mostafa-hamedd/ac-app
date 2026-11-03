import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

import { useSubmitRegistration } from '../hooks/use-auth-mutations';
import type { RegistrationOutcome } from '../types/auth.types';

/** The progress bar always plays for at least this long, even if the server answers instantly. */
const MIN_DURATION_MS = 2200;

export function VerifyingScreen({ registrationId }: { registrationId: string }) {
  const { t } = useTranslation();
  const submit = useSubmitRegistration();
  const progress = useSharedValue(0);

  function submitRegistration() {
    const startedAt = Date.now();
    progress.set(0);
    progress.set(withTiming(1, { duration: MIN_DURATION_MS }));

    function finish(outcome: RegistrationOutcome) {
      const remaining = Math.max(0, MIN_DURATION_MS - (Date.now() - startedAt));
      setTimeout(() => {
        router.replace(
          outcome === 'failed'
            ? { pathname: '/verifying-failed', params: { registrationId } }
            : { pathname: '/verifying-done', params: { registrationId } },
        );
      }, remaining);
    }

    // A rejected registration resolves with outcome 'failed'. An error here means the
    // request itself failed (offline, server down), so the user can simply try again.
    submit.mutate({ registrationId }, { onSuccess: (data) => finish(data.outcome) });
  }

  useEffect(() => {
    submitRegistration();
    // Submit once per registration; re-running on every render would resubmit it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  if (submit.isError) {
    return (
      <Screen edges={['top', 'bottom']} contentClassName="p-4">
        <ErrorState error={submit.error} onRetry={submitRegistration} />
        <Button variant="outline" onPress={() => router.back()}>
          {t('verifying.backToDocuments')}
        </Button>
      </Screen>
    );
  }

  return (
    <Screen
      preset="fixed"
      edges={['top', 'bottom']}

      contentClassName="flex-1 items-center justify-center gap-10 p-4">
      <Image
        source={require('@/assets/images/verifying-icon.png')}
        resizeMode="contain"
        style={{ width: 110, height: 85 }}
      />
      <View className="w-full max-w-60 gap-3">
        <Text className="text-center font-sans text-base text-foreground">
          {t('verifying.progress')}
        </Text>
        <View className="h-2 overflow-hidden rounded-full bg-primary/20">
          <Animated.View style={barStyle} className="h-full rounded-full bg-primary" />
        </View>
      </View>
    </Screen>
  );
}
