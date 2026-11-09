import { useTextAlign } from '@/shared/hooks/use-text-align';
import { cn } from '@/shared/utils/cn';

import { Text } from '../text';

type InputMessageProps = { error?: string; helperText?: string };

/** The line under a field: the error when there is one, otherwise the helper text. */
export function InputMessage({ error, helperText }: InputMessageProps) {
  const textAlign = useTextAlign();
  if (error) return <Text className={cn('text-sm text-destructive', textAlign)}>{error}</Text>;
  if (helperText)
    return (
      <Text variant="muted" className={textAlign}>
        {helperText}
      </Text>
    );
  return null;
}
