import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, useContext } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/shared/utils/cn';

/** Lets a parent (e.g. Button) set the text style of nested <Text>. */
export const TextClassContext = createContext<string | undefined>(undefined);

const textVariants = cva('font-sans text-sm text-foreground', {
  variants: {
    variant: {
      default: '',
      title: 'font-sans-semibold text-2xl',
      h2: 'font-sans-semibold text-xl',
      h3: 'font-sans-semibold text-lg',
      subtitle: 'font-sans-medium text-lg',
      large: 'font-sans-semibold text-base',
      small: 'font-sans-medium text-sm',
      muted: 'text-xs text-muted-foreground',
      link: 'text-link',
    },
  },
  defaultVariants: { variant: 'default' },
});

const ROLE_BY_VARIANT = { title: 'header', h2: 'header', h3: 'header' } as const;

export type TextProps = RNTextProps & VariantProps<typeof textVariants>;

export function Text({ className, variant, ...props }: TextProps) {
  const inherited = useContext(TextClassContext);
  const role = variant ? ROLE_BY_VARIANT[variant as keyof typeof ROLE_BY_VARIANT] : undefined;
  return (
    <RNText
      accessibilityRole={role}
      className={cn(textVariants({ variant }), inherited, className)}
      {...props}
    />
  );
}
