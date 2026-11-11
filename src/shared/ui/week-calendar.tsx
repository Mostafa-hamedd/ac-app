import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

import { Text } from './text';

export type WeekCalendarProps = {
  /** The selected day, or null. */
  value: Date | null;
  onChange: (date: Date) => void;
  /** Days before this one cannot be picked. Defaults to now; pass a fixed date in tests. */
  today?: Date;
  /** How many weeks to show, starting with the current one. */
  weeks?: number;
  className?: string;
};

const DAYS_IN_WEEK = 7;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * A few weeks of days to pick from, laid out in week rows under a month title and weekday
 * labels (Sunday first). Days before today are disabled.
 */
export function WeekCalendar({
  value,
  onChange,
  today = new Date(),
  weeks = 2,
  className,
}: WeekCalendarProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const row = locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
  // Keyed by the day (a number), so a new Date object each render does not recompute the grid.
  const todayKey = startOfDay(today).getTime();
  const todayStart = new Date(todayKey);

  const { rows, title, weekdays } = useMemo(() => {
    const base = new Date(todayKey);
    const weekStart = new Date(base);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const rows = Array.from({ length: weeks }, (_, week) =>
      Array.from({ length: DAYS_IN_WEEK }, (_, day) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + week * DAYS_IN_WEEK + day);
        return date;
      }),
    );
    // 2024-01-07 is a Sunday.
    const weekdays = Array.from({ length: DAYS_IN_WEEK }, (_, day) =>
      new Date(2024, 0, 7 + day).toLocaleDateString(locale, { weekday: 'short' }),
    );
    const title = base.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return { rows, title, weekdays };
  }, [todayKey, weeks, locale]);

  return (
    <View className={cn('gap-2', className)}>
      <Text className={cn('font-sans-medium text-sm', locale === 'ar' && 'text-right')}>
        {title}
      </Text>
      <View className={row}>
        {weekdays.map((weekday, index) => (
          <View key={index} className="flex-1 items-center">
            <Text variant="muted">{weekday}</Text>
          </View>
        ))}
      </View>
      {rows.map((days, rowIndex) => (
        <View key={rowIndex} className={row}>
          {days.map((date) => {
            const disabled = date < todayStart;
            const selected = !!value && sameDay(date, value);
            return (
              <Pressable
                key={date.getTime()}
                accessibilityRole="button"
                accessibilityLabel={date.toLocaleDateString(locale, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onChange(date)}
                className="flex-1 items-center py-1">
                <View
                  className={cn(
                    'size-10 items-center justify-center rounded-md',
                    selected && 'bg-primary',
                    disabled && 'opacity-40',
                  )}>
                  <Text
                    className={cn(
                      'font-sans-medium text-sm',
                      selected && 'text-primary-foreground',
                    )}>
                    {date.toLocaleDateString(locale, { day: 'numeric' })}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
