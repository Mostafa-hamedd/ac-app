import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';

import { ServicesBookingHeader } from '@/features/services';
import { VehicleHeroCard, VehicleTabs } from '@/features/vehicles';
import { Screen } from '@/shared/ui/screen';

import { AssistanceSheet } from '../components/assistance-sheet';
import { CallNowCard } from '../components/call-now-card';

export function MyGarageScreen() {
  const assistanceRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <Screen preset="scroll" edges={[]} contentClassName="gap-4">
        <VehicleTabs />
        <VehicleHeroCard onEditPhoto={() => router.push('/update-photo')} />
        <CallNowCard onPress={() => assistanceRef.current?.present()} />
        <ServicesBookingHeader onBookNew={() => router.push('/services')} />
      </Screen>
      <AssistanceSheet ref={assistanceRef} />
    </>
  );
}
