import { Calendar, Check, CircleDashed, Clock, LoaderCircle, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import type { ChecklistStep, OngoingService } from '../types/garage.types';

const STEP_ICON_SIZE = 12;

function StepIcon({ state }: { state: ChecklistStep['state'] }) {
  if (state === 'done') return <Check size={STEP_ICON_SIZE} color={colors.success} />;
  if (state === 'active') return <LoaderCircle size={STEP_ICON_SIZE} color={colors.foreground} />;
  return <CircleDashed size={STEP_ICON_SIZE} color={colors.foreground} />;
}

/** A small white pill with an icon and a short value (the estimated date or time). */
function EstimateBadge({ icon, value }: { icon: React.ReactNode; value: string }) {
  const { i18n } = useTranslation();
  return (
    <View
      className={cn(
        'items-center gap-1 rounded-xs bg-card px-2 py-1',
        i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row',
      )}>
      {icon}
      <Text className="font-sans-semibold text-2xs">{value}</Text>
    </View>
  );
}

/** The service the car is in for now: its progress checklist and when it will be ready. */
export function OngoingServiceCard({
  service,
  onOpenCenter,
}: {
  service: OngoingService;
  onOpenCenter: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  const align = isArabic ? 'items-end' : 'items-start';

  return (
    <Card className="gap-4 rounded-xs p-4.5">
      <View className={cn('gap-1', align)}>
        <View className={cn(row, 'items-center gap-1.5')}>
          <View className="size-1.5 rounded-full bg-foreground" />
          <Text className="font-sans-semibold text-xs">{t('myGarage.inProgress')}</Text>
        </View>
        <Text variant="large" className="text-base">
          {service.title[lang]}
        </Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={service.center[lang]}
          onPress={onOpenCenter}
          hitSlop={8}
          className={cn(row, 'items-center gap-1.5 active:opacity-60')}>
          <MapPin size={12} color={colors['muted-foreground']} />
          <Text variant="muted" className="underline">
            {service.center[lang]}
          </Text>
        </Pressable>
      </View>

      <View className="gap-2.5 py-1">
        {service.steps.map((step) => (
          <View
            key={step.id}
            className={cn(row, 'items-center gap-2.5', step.state === 'pending' && 'opacity-45')}>
            <StepIcon state={step.state} />
            <Text
              className={cn(
                'text-sm',
                step.state === 'done' && 'text-muted-foreground line-through',
                step.state === 'active' && 'font-sans-semibold',
              )}>
              {step.label[lang]}
            </Text>
          </View>
        ))}
      </View>

      <View className="h-px bg-border" />

      <View className={cn(row, 'items-center justify-between')}>
        <Text variant="muted">{t('myGarage.readyEstimation')}</Text>
        <View className={cn(row, 'gap-2')}>
          <EstimateBadge
            icon={<Calendar size={12} color={colors.foreground} />}
            value={service.readyDate[lang]}
          />
          <EstimateBadge
            icon={<Clock size={12} color={colors.foreground} />}
            value={service.readyTime[lang]}
          />
        </View>
      </View>
    </Card>
  );
}
