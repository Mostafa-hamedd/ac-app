import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';

/** Visual style. `default` is the filled primary button. */
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

/** `md` is the design's 52dp button, `sm` a compact 40dp one, `auto` hugs its content. */
export type ButtonSize = 'sm' | 'md' | 'auto';

/** Corner style: the design's rounded rectangle or a fully rounded pill. */
export type ButtonShape = 'rounded' | 'pill';

/** What a button passes to an icon render function so the icon matches the label. */
export type ButtonIconContext = { color: string; size: number };

/** An icon element, or a function that receives the label colour and a suggested size. */
export type ButtonIcon = ReactNode | ((context: ButtonIconContext) => ReactNode);

export type ButtonProps = Omit<PressableProps, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Text label. Ignored when `children` is given. */
  label?: string;
  /** Shows a spinner and blocks presses (prevents duplicate submissions). */
  loading?: boolean;
  /** Icon before the label (the left side in LTR, the right side in RTL layouts). */
  leftIcon?: ButtonIcon;
  /** Icon after the label. */
  rightIcon?: ButtonIcon;
  /** Extra classes for the pressable container. */
  className?: string;
  /** Extra classes for the label text. */
  textClassName?: string;
  /** Custom content; a plain string is rendered as the label. */
  children?: ReactNode;
};
