import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Calendar, Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { formatSlot, TIME_SLOTS } from '@/features/services';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { WeekCalendar } from '@/shared/ui/week-calendar';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

/** Top corner radius of the sheet in the design. */
const SHEET_RADIUS = 30;

/** Height of the sheet in the design; the date and time pickers float over it instead of resizing it. */
const SHEET_HEIGHT = 419;
const SNAP_POINTS = [SHEET_HEIGHT];

/** Whether an "HH:mm" slot has already started on `day`, judged against `now`. */
function isPastSlot(slot: string, day: Date | null, now: Date): boolean {
  if (!day) return false;
  const sameDay =
    day.getFullYear() === now.getFullYear() &&
    day.getMonth() === now.getMonth() &&
    day.getDate() === now.getDate();
  if (!sameDay) return false;
  const [hours, minutes] = slot.split(':').map(Number);
  return hours! * 60 + minutes! <= now.getHours() * 60 + now.getMinutes();
}

export type RescheduleSheetProps = {
  ref?: React.Ref<BottomSheetModal>;
  /** Called with the new day and "HH:mm" slot when Update is pressed. */
  onUpdate: (date: Date, time: string) => void;
  /** The current moment, so slots that have passed today can be disabled. Defaults to now. */
  now?: Date;
};

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.9} />;
}

/**
 * A panel that floats over the sheet, so opening it never moves the fields around it. It sits
 * just under its field, or on top of it (`cover`) when it needs more room than is left below.
 */
function Popover({ children, cover = false }: { children: React.ReactNode; cover?: boolean }) {
  return (
    <View
      className={cn(
        'absolute inset-x-0 rounded-lg border border-border bg-card p-2',
        cover ? '-top-3' : 'top-full mt-2',
      )}
      style={{
        elevation: 8,
        shadowColor: colors.foreground,
        shadowOpacity: 0.12,
        shadowRadius: 12,
      }}>
      {children}
    </View>
  );
}

type PickerFieldProps = {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  open: boolean;
  onPress: () => void;
};

/** A tappable box showing its label (and the chosen value), with a black icon button at the end. */
function PickerField({ label, value, icon, open, onPress }: PickerFieldProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      className={cn(
        'h-14 items-center justify-between rounded-lg border px-6 active:opacity-80',
        isArabic ? 'flex-row-reverse' : 'flex-row',
        value || open ? 'border-input/20' : 'border-input/10',
      )}>
      <View className={cn('gap-1', isArabic ? 'items-end' : 'items-start')}>
        <Text className={cn('text-muted-foreground', value ? 'text-2xs' : 'text-sm')}>
          {label} <Text className={cn('text-destructive', value ? 'text-2xs' : 'text-sm')}>*</Text>
        </Text>
        {value ? <Text className="text-sm">{value}</Text> : null}
      </View>
      <View className="size-9 items-center justify-center rounded-sm bg-primary">{icon}</View>
    </Pressable>
  );
}

/** "Reschedule Booking" sheet: pick a new appointment date and time, then Update. */
export function RescheduleSheet({ ref, onUpdate, now }: RescheduleSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const isArabic = locale === 'ar';
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [panel, setPanel] = useState<'date' | 'time' | null>(null);

  // Read when the sheet is used, not when it is created, so a long-lived sheet stays current.
  const nowOrCurrent = () => now ?? new Date();

  function close() {
    if (ref && typeof ref === 'object') ref.current?.dismiss();
  }

  function reset() {
    setDate(null);
    setTime(null);
    setPanel(null);
  }

  function update() {
    if (!date || !time) return;
    onUpdate(date, time);
    close();
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={reset}
      backdropComponent={Backdrop}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: SHEET_RADIUS,
        borderTopRightRadius: SHEET_RADIUS,
      }}
      handleComponent={null}>
      <BottomSheetView className="gap-4 px-6 pb-8 pt-4">
        {/* Tapping anywhere outside an open picker closes it. */}
        {panel ? (
          <Pressable
            accessibilityLabel={t('common.close')}
            onPress={() => setPanel(null)}
            className="absolute inset-0"
            style={{ zIndex: 5 }}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          className="size-9 items-center justify-center self-end rounded-full border border-border active:opacity-80">
          <X size={16} color={colors.foreground} />
        </Pressable>

        <Text
          accessibilityRole="header"
          className={cn('font-sans-medium text-lg', isArabic && 'text-right')}>
          {t('myGarage.rescheduleTitle')}
        </Text>
        <View className="h-line bg-border" />

        <View className="gap-4">
          <View style={{ zIndex: panel === 'date' ? 10 : 0 }}>
            <PickerField
              label={t('myGarage.appointmentDate')}
              value={
                date
                  ? date.toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : null
              }
              icon={<Calendar size={16} color={colors['primary-foreground']} />}
              open={panel === 'date'}
              onPress={() => setPanel(panel === 'date' ? null : 'date')}
            />
            {panel === 'date' ? (
              <Popover cover>
                <WeekCalendar
                  wholeMonth
                  compact
                  value={date}
                  onChange={(next) => {
                    setDate(next);
                    // A time that has already passed on the new day can no longer be used.
                    if (time && isPastSlot(time, next, nowOrCurrent())) setTime(null);
                    setPanel(null);
                  }}
                />
              </Popover>
            ) : null}
          </View>

          <View style={{ zIndex: panel === 'time' ? 10 : 0 }}>
            <PickerField
              label={t('myGarage.appointmentTime')}
              value={time ? formatSlot(time, locale) : null}
              icon={<Clock size={16} color={colors['primary-foreground']} />}
              open={panel === 'time'}
              onPress={() => setPanel(panel === 'time' ? null : 'time')}
            />
            {panel === 'time' ? (
              <Popover>
                <View className={cn('flex-wrap gap-2', isArabic ? 'flex-row-reverse' : 'flex-row')}>
                  {TIME_SLOTS.map((slot) => (
                    <Button
                      key={slot}
                      size="auto"
                      disabled={isPastSlot(slot, date, nowOrCurrent())}
                      variant={time === slot ? 'default' : 'subtle'}
                      className="px-3 py-2"
                      textClassName="text-xs"
                      accessibilityRole="radio"
                      accessibilityState={{ selected: time === slot }}
                      label={formatSlot(slot, locale)}
                      onPress={() => {
                        setTime(slot);
                        setPanel(null);
                      }}
                    />
                  ))}
                </View>
              </Popover>
            ) : null}
          </View>

          <Button
            disabled={!date || !time}
            label={t('myGarage.update')}
            textClassName="font-sans"
            onPress={update}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
