import { CircleHelp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui';
import { colors } from '@/theme';

/** "Need Help with your Garage?" link at the bottom of My Garage. */
export function GarageHelpFooter({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="auto"
      className="py-3"
      textClassName="text-sm text-muted-foreground underline"
      label={t('myGarage.needHelp')}
      leftIcon={({ size }) => <CircleHelp size={size - 2} color={colors['muted-foreground']} />}
      onPress={onPress}
    />
  );
}
