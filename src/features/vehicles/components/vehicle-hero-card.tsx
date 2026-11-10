import { Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui';

import { VehiclePhoto } from './vehicle-photo';

type VehicleHeroCardProps = {
  /** The camera button was pressed (open the Update Photo screen). */
  onEditPhoto: () => void;
};

/** Home card showing the vehicle photo, with a camera button to change it. */
export function VehicleHeroCard({ onEditPhoto }: VehicleHeroCardProps) {
  const { t } = useTranslation();
  return (
    <VehiclePhoto className="aspect-[358/200] w-full">
      <View className="absolute end-3 top-3">
        <Button
          variant="light"
          size="icon"
          accessibilityLabel={t('vehicles.changePhoto')}
          onPress={onEditPhoto}
          leftIcon={({ color }) => <Camera size={16} color={color} />}
        />
      </View>
    </VehiclePhoto>
  );
}
