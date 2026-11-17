import { Calendar, FileText, RefreshCw, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { BookedService } from '../types/garage.types';

type ServiceBookingCardProps = {
  service: BookedService;
  onCancel: () => void;
  onReschedule: () => void;
  onViewDetails: () => void;
};

/**
 * A booked service. An upcoming one can be cancelled or rescheduled; a completed one links to
 * its details.
 */
export function ServiceBookingCard({
  service,
  onCancel,
  onReschedule,
  onViewDetails,
}: ServiceBookingCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const isUpcoming = service.status === 'upcoming';

  return (
    <Card className="gap-3.5 rounded-xs">
      <View className={cn(row, 'items-center justify-between gap-3')}>
        <View className={cn('flex-1 gap-1', isArabic ? 'items-end' : 'items-start')}>
          <View className={cn(row, 'items-center gap-1.5')}>
            <Calendar size={12} color={colors['muted-foreground']} />
            <Text variant="muted" className="text-caption">
              {service.date[lang]}
            </Text>
          </View>
          <Text className="font-sans-semibold text-subhead">{service.title[lang]}</Text>
        </View>
        <View
          className={cn(
            'rounded-xs border px-2 py-1',
            isUpcoming ? 'border-gold bg-gold/15' : 'border-success bg-success/15',
          )}>
          <Text
            className={cn(
              'font-sans-semibold text-2xs',
              isUpcoming ? 'text-gold' : 'text-success',
            )}>
            {t(`services.status.${service.status}`)}
          </Text>
        </View>
      </View>

      <View className="h-line bg-border" />

      {isUpcoming ? (
        <View className={cn(row, 'gap-2.5')}>
          <Button
            variant="outline"
            size="auto"
            className="h-9 flex-1 rounded-xs"
            textClassName="text-xs font-sans-semibold"
            label={t('myGarage.cancel')}
            leftIcon={({ color }) => <X size={12} color={color} />}
            onPress={onCancel}
          />
          <Button
            size="auto"
            className="h-9 flex-1 rounded-xs"
            textClassName="text-xs font-sans-semibold"
            label={t('myGarage.reschedule')}
            leftIcon={({ color }) => <RefreshCw size={12} color={color} />}
            onPress={onReschedule}
          />
        </View>
      ) : (
        <Button
          variant="outline"
          size="auto"
          className="h-9 rounded-xs"
          textClassName="text-xs font-sans-semibold"
          label={t('myGarage.viewServiceDetails')}
          leftIcon={({ color }) => <FileText size={12} color={color} />}
          onPress={onViewDetails}
        />
      )}
    </Card>
  );
}
