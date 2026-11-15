import { Check } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

export type CheckboxProps = Omit<PressableProps, 'onPress' | 'children'> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Read by screen readers; the visible label sits next to the box. */
  accessibilityLabel: string;
};

/** A square box that shows a check mark while `checked`. */
export function Checkbox({
  checked,
  onCheckedChange,
  accessibilityLabel,
  className,
  ...props
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled: !!props.disabled }}
      hitSlop={8}
      onPress={() => onCheckedChange(!checked)}
      className={cn(
        'size-6 items-center justify-center rounded-sm border active:opacity-80',
        checked ? 'border-primary bg-primary' : 'border-border bg-card',
        className,
      )}
      {...props}>
      {checked ? <Check size={14} color={colors['primary-foreground']} /> : null}
    </Pressable>
  );
}
