import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

import { FloatingLabelField, type FloatingLabelFieldProps } from './floating-label-field';

export type PasswordFieldProps = Omit<
  FloatingLabelFieldProps,
  'secureTextEntry' | 'trailing' | 'label'
> & { label?: string };

/** Password field with a show/hide toggle (eye-off while the text is hidden). */
export function PasswordField({ label, ...props }: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <FloatingLabelField
      label={label ?? t('fields.password')}
      secureTextEntry={!visible}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(visible ? 'fields.hidePassword' : 'fields.showPassword')}
          onPress={() => setVisible((current) => !current)}
          hitSlop={8}>
          {visible ? (
            <Eye size={24} strokeWidth={1.5} color={colors.foreground} />
          ) : (
            <EyeOff size={24} strokeWidth={1.5} color={colors.foreground} />
          )}
        </Pressable>
      }
      {...props}
    />
  );
}
