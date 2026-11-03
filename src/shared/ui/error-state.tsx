import { CircleAlert, Lock, SearchX, WifiOff, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { toApiError, type ApiErrorKind } from '@/lib/api/api-error';
import { colors } from '@/theme';

import { Button } from './button';
import { Text } from './text';

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
};

type ErrorTitle =
  'networkTitle' | 'forbiddenTitle' | 'notFoundTitle' | 'unauthorizedTitle' | 'genericTitle';

type Display = { icon: LucideIcon; title: ErrorTitle };

const DISPLAY: Partial<Record<ApiErrorKind, Display>> = {
  network: { icon: WifiOff, title: 'networkTitle' },
  forbidden: { icon: Lock, title: 'forbiddenTitle' },
  not_found: { icon: SearchX, title: 'notFoundTitle' },
  unauthorized: { icon: CircleAlert, title: 'unauthorizedTitle' },
};

const FALLBACK: Display = { icon: CircleAlert, title: 'genericTitle' };

/** Full-area error with a retry button for recoverable failures. */
export function ErrorState({ error, onRetry, retrying }: ErrorStateProps) {
  const { t } = useTranslation();
  const apiError = toApiError(error);
  const { icon: Icon, title } = DISPLAY[apiError.kind] ?? FALLBACK;

  return (
    <View className="flex-1 items-center justify-center gap-3 p-6" accessibilityRole="alert">
      <Icon size={40} color={colors['muted-foreground']} />
      <Text variant="h3" className="text-center">
        {t(`errors.${title}`)}
      </Text>
      <Text variant="muted" className="text-center">
        {apiError.message}
      </Text>
      {onRetry && apiError.isRetryable ? (
        <Button variant="outline" onPress={onRetry} loading={retrying} className="mt-2">
          {t('common.tryAgain')}
        </Button>
      ) : null}
    </View>
  );
}
