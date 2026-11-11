import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

type ServicesBookingHeaderProps = {
  /** The "Book New" button was pressed (open All Services). */
  onBookNew: () => void;
};

/** "Services & Booking" section title with its Book New button, shown on Home. */
export function ServicesBookingHeader({ onBookNew }: ServicesBookingHeaderProps) {
  const { t, i18n } = useTranslation();
  return (
    <View
      className={cn(
        'items-center justify-between gap-3',
        i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row',
      )}>
      <Text variant="h3" className="flex-1">
        {t('services.servicesAndBooking')}
      </Text>
      <Button
        size="auto"
        className="px-6 py-2"
        textClassName="text-xs"
        label={t('services.bookNew')}
        onPress={onBookNew}
      />
    </View>
  );
}
