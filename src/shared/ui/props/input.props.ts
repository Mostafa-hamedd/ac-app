import type { ReactNode, Ref } from 'react';
import type { TextInputInstance, TextInputProps } from 'react-native';

/**
 * `floating`: bordered box whose label floats into the top border (the app's text field).
 * `outline`: bordered box with a static label above it and a real placeholder.
 * `bare`: just the text input, for use inside another container (search bars, cards).
 */
export type InputVariant = 'floating' | 'outline' | 'bare';

/** `md` is the design's 56dp field. `sm` is more compact. */
export type InputSize = 'sm' | 'md';

export type InputProps = Omit<TextInputProps, 'placeholder'> & {
  ref?: Ref<TextInputInstance>;
  variant?: InputVariant;
  size?: InputSize;
  /** The field's name. Floats in the border (`floating`), sits above (`outline`), or is read by screen readers (`bare`). */
  label?: string;
  /** Hint shown while the field is empty. In `floating` it appears once the label has floated. */
  placeholder?: string;
  /** Message below the field. Replaced by `error` when both are set. */
  helperText?: string;
  /** Error message below the field; also turns the border red. */
  error?: string;
  /** Blocks editing and dims the field. */
  disabled?: boolean;
  /** Rendered inside the box, before the input (e.g. a flag, or a search icon). */
  leading?: ReactNode;
  /** Rendered inside the box, after the input (e.g. a password-visibility toggle). */
  trailing?: ReactNode;
  /** Classes for the outermost wrapper. */
  containerClassName?: string;
  /** Classes for the native text input (same as `className`, which is kept for TextInput parity). */
  inputClassName?: string;
};
