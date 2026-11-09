import type { InputProps } from '../props/input.props';

import { FloatingInput } from './floating-input';
import { StaticInput } from './static-input';

/**
 * The app's text input. All props of React Native's `TextInput` are passed through
 * (`value`, `onChangeText`, `keyboardType`, `secureTextEntry`, `maxLength`, `ref`, …).
 * `variant` picks the look: `floating` (default), `outline` or `bare`.
 */
export function Input({ variant = 'floating', ...props }: InputProps) {
  if (variant === 'floating') return <FloatingInput {...props} />;
  return <StaticInput variant={variant} {...props} />;
}
