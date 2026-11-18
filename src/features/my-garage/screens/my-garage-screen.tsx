import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { formatSlot, ServicesBookingHeader } from '@/features/services';
import { VehicleHeroCard, VehicleTabs } from '@/features/vehicles';
import { useContactSupport } from '@/shared/hooks/use-contact-support';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { AssistanceSheet } from '../components/assistance-sheet';
import { CallNowCard } from '../components/call-now-card';
import { DuePaymentCard } from '../components/due-payment-card';
import { GarageHelpFooter } from '../components/garage-help-footer';
import { OngoingServiceCard } from '../components/ongoing-service-card';
import { RescheduleSheet } from '../components/reschedule-sheet';
import { ServiceBookingCard } from '../components/service-booking-card';
import { MOCK_BOOKED_SERVICES, MOCK_DUE_PAYMENTS, MOCK_ONGOING_SERVICE } from '../data/mock-garage';
import type { BookedService } from '../types/garage.types';

export function MyGarageScreen() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const assistanceRef = useRef<BottomSheetModal>(null);
  const contactSupport = useContactSupport();
  const rescheduleRef = useRef<BottomSheetModal>(null);
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  // The booking being rescheduled, and the new slot of each booking that was (kept locally).
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newSlots, setNewSlots] = useState<Record<string, { date: Date; time: string }>>({});

  const bookedServices = MOCK_BOOKED_SERVICES.filter(
    (service) => !cancelledIds.includes(service.id),
  ).map((service) => {
    const slot = newSlots[service.id];
    if (!slot) return service;
    const label = (locale: 'en' | 'ar') =>
      `${slot.date.toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { day: '2-digit', month: 'short', year: 'numeric' })} · ${formatSlot(slot.time, locale)}`;
    return { ...service, date: { en: label('en'), ar: label('ar') } };
  });
  const titleAlign = isArabic ? 'text-right' : undefined;

  function confirmCancel(service: BookedService) {
    Alert.alert(
      t('myGarage.cancelTitle'),
      t('myGarage.cancelMessage', { service: service.title[lang] }),
      [
        { text: t('myGarage.keepBooking'), style: 'cancel' },
        {
          text: t('myGarage.confirmCancel'),
          style: 'destructive',
          onPress: () => setCancelledIds((ids) => [...ids, service.id]),
        },
      ],
    );
  }

  return (
    <>
      <Screen preset="scroll" edges={[]} contentClassName="gap-4">
        <VehicleTabs onAddVehicle={() => router.push('/add-vehicle')} />
        <VehicleHeroCard onEditPhoto={() => router.push('/update-photo')} />
        <CallNowCard onPress={() => assistanceRef.current?.present()} />

        <View className="gap-3">
          <Text variant="h3" className={cn(titleAlign)}>
            {t('myGarage.ongoingService')}
          </Text>
          <OngoingServiceCard
            service={MOCK_ONGOING_SERVICE}
            onOpenCenter={() =>
              router.push({
                pathname: '/location',
                params: { centerId: MOCK_ONGOING_SERVICE.centerId },
              })
            }
          />
        </View>

        <View className="gap-3">
          <ServicesBookingHeader onBookNew={() => router.push('/services')} />
          {bookedServices.map((service) => (
            <ServiceBookingCard
              key={service.id}
              service={service}
              onCancel={() => confirmCancel(service)}
              onReschedule={() => {
                setReschedulingId(service.id);
                rescheduleRef.current?.present();
              }}
              onViewDetails={() => router.push('/services')}
            />
          ))}
        </View>

        <View className="gap-3">
          <Text variant="h3" className={cn(titleAlign)}>
            {t('myGarage.duePayments')}
          </Text>
          {MOCK_DUE_PAYMENTS.map((payment) => (
            <DuePaymentCard
              key={payment.id}
              payment={payment}
              // The invoice and the payment page for this fee are not designed yet.
              onViewInvoice={() => undefined}
              onPayNow={() => undefined}
            />
          ))}
        </View>

        <GarageHelpFooter onPress={contactSupport} />
      </Screen>
      <AssistanceSheet ref={assistanceRef} />
      <RescheduleSheet
        ref={rescheduleRef}
        onUpdate={(date, time) => {
          if (reschedulingId)
            setNewSlots((slots) => ({ ...slots, [reschedulingId]: { date, time } }));
        }}
      />
    </>
  );
}
