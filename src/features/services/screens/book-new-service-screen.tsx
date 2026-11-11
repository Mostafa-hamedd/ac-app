import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { MAINTENANCE_CENTERS } from '@/features/locations';
import { useSelectedVehicle, vehicleLabel } from '@/features/vehicles';
import { Button, Input } from '@/shared/ui';
import { Card } from '@/shared/ui/card';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SelectField } from '@/shared/ui/select-field';
import { Text } from '@/shared/ui/text';
import { WeekCalendar } from '@/shared/ui/week-calendar';
import { cn } from '@/shared/utils/cn';
import { formatNumber } from '@/shared/utils/format';

import {
  estimateCost,
  MAINTENANCE_PACKAGES_KM,
  needsMaintenancePackage,
  TIME_SLOTS,
} from '../data/booking-options';
import { isBookingComplete, isServiceTypeId, type BookingForm } from '../utils/booking-form';

/** Formats an "HH:mm" slot as a time in the app's language. */
function formatSlot(slot: string, locale: string): string {
  const [hours, minutes] = slot.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Step two of booking. Regular maintenance asks which mileage package; every other service
 * asks for notes instead, shown under the calendar.
 */
export function BookNewServiceScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  const row = locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
  const params = useLocalSearchParams<{ type?: string }>();
  const serviceType = isServiceTypeId(params.type) ? params.type : 'other';
  const isMaintenance = needsMaintenancePackage(serviceType);
  const { vehicles, selected: homeVehicle } = useSelectedVehicle();

  const [packageKm, setPackageKm] = useState<number | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const vehicleId = homeVehicle?.id ?? null;

  const form: BookingForm = { serviceType, packageKm, vehicleId, centerId, date, time, notes };
  const cost = estimateCost(serviceType, packageKm);
  const costText =
    cost === undefined
      ? '—'
      : cost === null
        ? t('services.form.toBeQuoted')
        : t('services.form.cost', { amount: formatNumber(cost) });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={t('services.bookScreenTitle')}
        titleVariant="large"
        bordered
         // Tabs remember the last tab, not the last step, so go to the type picker explicitly.
        onBack={() => router.navigate('/book-service')}
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 pb-6 pt-[20px]"
        keyboardShouldPersistTaps="handled">
        {/* The car is the one selected in My Garage; it cannot be changed here. */}
        <SelectField
          label={t('services.form.carModel')}
          required
          placeholder={t('services.form.selectCar')}
          options={vehicles.map((vehicle) => ({
            value: vehicle.id,
            label: `${vehicleLabel(vehicle)} ${vehicle.year}`,
          }))}
          value={vehicleId}
          onChange={() => undefined}
          disabled
        />
        {isMaintenance ? (
          <SelectField
            label={t('services.form.serviceType')}
            required
            placeholder={t('services.form.selectMaintenance')}
            options={MAINTENANCE_PACKAGES_KM.map((km) => ({
              value: String(km),
              label: t('services.form.maintenancePackage', { km: formatNumber(km) }),
            }))}
            value={packageKm === null ? null : String(packageKm)}
            onChange={(value) => setPackageKm(Number(value))}
          />
        ) : null}

        <View className={cn(row, 'items-center justify-between rounded-lg border border-border border-[#000] px-4 py-4')}>
          <Text className="font-sans-medium text-xs">{t('services.form.estimatedCost')}</Text>
          <Text className="font-sans-medium text-xs">{costText}</Text>
        </View>

        <Card className="gap-4">
          <Text className="font-sans-medium text-sm">{t('services.form.appointmentDetails')}</Text>

          <SelectField
            label={t('services.form.serviceCenter')}
            required
            placeholder={t('services.form.selectCenter')}
            options={MAINTENANCE_CENTERS.map((center) => ({
              value: center.id,
              label: center.name[locale],
            }))}
            value={centerId}
            onChange={setCenterId}
          />

          <WeekCalendar value={date} onChange={setDate} />

          <View className="gap-2">
            <Text className={cn('font-sans-medium text-xs', locale === 'ar' && 'text-right')}>
              {t('services.form.selectTimeSlot')} *
            </Text>
            <View className={cn(row, 'flex-wrap gap-2')}>
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  size="auto"
                  variant={time === slot ? 'default' : 'subtle'}
                  className="rounded-md px-3 py-2"
                  textClassName="text-xs"
                  accessibilityRole="radio"
                  accessibilityState={{ selected: time === slot }}
                  label={formatSlot(slot, locale)}
                  onPress={() => setTime(slot)}
                />
              ))}
            </View>
          </View>

          {!isMaintenance ? (
            <Input
              variant="outline"
              label={t('services.form.notesLabel', { type: t(`services.types.${serviceType}`) })}
              placeholder={t('services.form.notesPlaceholder')}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          ) : null}

        </Card>

        <Text variant="muted" className="text-center">
          {t('services.form.terms')}
        </Text>
        <Button disabled={!isBookingComplete(form)} label={t('services.form.confirm')} />
      </ScrollView>
    </View>
  );
}
