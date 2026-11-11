import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

/** Height of every tile in the design. */
const CARD_HEIGHT = { height: 100 };

type ServiceTypeCardProps = {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onPress: () => void;
  className?: string;
};

/** A selectable tile with an icon above its label (one per service type). */
export function ServiceTypeCard({
  label,
  icon: Icon,
  selected,
  onPress,
  className,
}: ServiceTypeCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={CARD_HEIGHT}
      className={cn(
        'items-center justify-center gap-3 rounded-lg border active:opacity-80',
        selected ? 'border-primary  ' : 'border-border bg-card',
        className,
      )}>
      <Icon size={24} color={colors.foreground} />
      <Text className="font-sans-medium text-sm text-primary font-bold">{label}</Text>
    </Pressable>
  );
}
