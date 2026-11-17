import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { Text } from './text';

export type WeekCalendarProps = {
  /** The selected day, or null. */
  value: Date | null;
  onChange: (date: Date) => void;
  /** Days before this one cannot be picked. Defaults to now; pass a fixed date in tests. */
  today?: Date;
  /** How many weeks to show, starting with the current one. */
  weeks?: number;
  /**
   * Show a whole month at a time (days outside it stay empty) instead of `weeks` weeks. The month
   * and year can be changed with the arrows, or by tapping the title to pick them directly.
   */
  wholeMonth?: boolean;
  /** Smaller day cells, for tight spaces. */
  compact?: boolean;
  className?: string;
};

const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;
/** How far ahead a month can be chosen in month view. */
const MONTHS_AHEAD = 24;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
/** Months since year 0, so two months compare (and subtract) as plain numbers. */
const monthIndex = (year: number, month: number) => year * MONTHS_IN_YEAR + month;

type NavButtonProps = {
  label: string;
  direction: 'previous' | 'next';
  disabled: boolean;
  onPress: () => void;
};

/** A small arrow; the glyph is mirrored in Arabic so "next" always points the reading way. */
function NavButton({ label, direction, disabled, onPress }: NavButtonProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const pointsLeft = (direction === 'previous') !== isArabic;
  const Icon = pointsLeft ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      className={cn('size-8 items-center justify-center rounded-md', disabled && 'opacity-30')}>
      <Icon size={18} color={colors.foreground} />
    </Pressable>
  );
}

/**
 * A few weeks of days to pick from, laid out in week rows under a month title and weekday
 * labels (Sunday first). Days before today are disabled.
 */
export function WeekCalendar({
  value,
  onChange,
  today = new Date(),
  weeks = 2,
  wholeMonth = false,
  compact = false,
  className,
}: WeekCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isArabic = locale === 'ar';
  const row = isArabic ? 'flex-row-reverse' : 'flex-row';
  // Keyed by the day (a number), so a new Date object each render does not recompute the grid.
  const todayKey = startOfDay(today).getTime();
  const todayStart = new Date(todayKey);
  const currentMonth = monthIndex(todayStart.getFullYear(), todayStart.getMonth());
  const lastMonth = currentMonth + MONTHS_AHEAD;

  // The month on show (month view only), as months since year 0. Starts on the selected day's month.
  const [shown, setShown] = useState(() =>
    value && wholeMonth ? monthIndex(value.getFullYear(), value.getMonth()) : currentMonth,
  );
  const [choosing, setChoosing] = useState(false);
  const shownYear = Math.floor(shown / MONTHS_IN_YEAR);
  const shownMonth = shown % MONTHS_IN_YEAR;

  const { rows, title, weekdays } = useMemo(() => {
    const base = new Date(todayKey);
    // A month starts on its 1st; otherwise the grid starts with the current week.
    const first = wholeMonth ? new Date(shownYear, shownMonth, 1) : base;
    const weekStart = new Date(first);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const daysInMonth = new Date(shownYear, shownMonth + 1, 0).getDate();
    const weekCount = wholeMonth ? Math.ceil((first.getDay() + daysInMonth) / DAYS_IN_WEEK) : weeks;
    const rows = Array.from({ length: weekCount }, (_, week) =>
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
    const titleDate = wholeMonth ? first : base;
    const title = titleDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return { rows, title, weekdays };
  }, [todayKey, weeks, wholeMonth, shownYear, shownMonth, locale]);

  if (wholeMonth && choosing) {
    const firstYear = Math.floor(currentMonth / MONTHS_IN_YEAR);
    const lastYear = Math.floor(lastMonth / MONTHS_IN_YEAR);
    const monthNames = Array.from({ length: MONTHS_IN_YEAR }, (_, month) =>
      new Date(2024, month, 1).toLocaleDateString(locale, { month: 'short' }),
    );
    return (
      <View className={cn('gap-2', className)}>
        <View className={cn(row, 'items-center justify-between')}>
          <NavButton
            direction="previous"
            label={t('calendar.previousYear')}
            disabled={shownYear <= firstYear}
            onPress={() => setShown(shown - MONTHS_IN_YEAR)}
          />
          <Text accessibilityRole="header" className="font-sans-medium text-sm">
            {new Date(shownYear, 0, 1).toLocaleDateString(locale, { year: 'numeric' })}
          </Text>
          <NavButton
            direction="next"
            label={t('calendar.nextYear')}
            disabled={shownYear >= lastYear}
            onPress={() => setShown(shown + MONTHS_IN_YEAR)}
          />
        </View>
        <View className={cn(row, 'flex-wrap')}>
          {monthNames.map((name, month) => {
            const index = monthIndex(shownYear, month);
            const disabled = index < currentMonth || index > lastMonth;
            const selected = index === shown;
            return (
              <Pressable
                key={month}
                accessibilityRole="button"
                accessibilityLabel={new Date(shownYear, month, 1).toLocaleDateString(locale, {
                  month: 'long',
                  year: 'numeric',
                })}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => {
                  setShown(index);
                  setChoosing(false);
                }}
                className="w-1/4 items-center py-0.5">
                <View
                  className={cn(
                    'h-9 w-full items-center justify-center rounded-md',
                    selected && 'bg-primary',
                    disabled && 'opacity-40',
                  )}>
                  <Text
                    className={cn(
                      'font-sans-medium text-sm',
                      selected && 'text-primary-foreground',
                    )}>
                    {name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View className={cn(compact ? 'gap-0.5' : 'gap-2', className)}>
      {wholeMonth ? (
        <View className={cn(row, 'items-center justify-between')}>
          <NavButton
            direction="previous"
            label={t('calendar.previousMonth')}
            disabled={shown <= currentMonth}
            onPress={() => setShown(shown - 1)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.chooseMonth', { month: title })}
            onPress={() => setChoosing(true)}
            hitSlop={6}
            className="rounded-md px-2 py-1 active:opacity-70">
            <Text className="font-sans-medium text-sm">{title}</Text>
          </Pressable>
          <NavButton
            direction="next"
            label={t('calendar.nextMonth')}
            disabled={shown >= lastMonth}
            onPress={() => setShown(shown + 1)}
          />
        </View>
      ) : (
        <Text className={cn('font-sans-medium text-sm', isArabic && 'text-right')}>{title}</Text>
      )}
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
            // In month view the days of the neighbouring months are left empty.
            if (wholeMonth && monthIndex(date.getFullYear(), date.getMonth()) !== shown) {
              return <View key={date.getTime()} className="flex-1" />;
            }
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
                className={cn('flex-1 items-center', compact ? 'py-0.5' : 'py-1')}>
                <View
                  className={cn(
                    compact ? 'size-7' : 'size-10',
                    'items-center justify-center rounded-md',
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
