import { cssInterop } from 'nativewind';
import { ScrollView, View, type ViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/shared/utils/cn';

import { OfflineBanner } from './offline-banner';

// Third-party components need NativeWind interop to accept className props.
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

type ScreenProps = ViewProps & {
  /**
   * fixed:    content manages its own scrolling (e.g. FlashList)
   * scroll:   simple scrolling content
   * keyboard: forms — scrolls focused inputs above the keyboard
   */
  preset?: 'fixed' | 'scroll' | 'keyboard';
  /** Screens under a native header usually only need the bottom edge. */
  edges?: Edge[];
  contentClassName?: string;
  /** Shows the offline banner under the header (default: true). */
  offlineBanner?: boolean;
};

export function Screen({
  preset = 'fixed',
  edges = ['bottom'],
  className,
  contentClassName,
  offlineBanner = true,
  children,
  ...props
}: ScreenProps) {
  const content =
    preset === 'scroll' ? (
      <ScrollView
        contentContainerClassName={cn('grow p-4', contentClassName)}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    ) : preset === 'keyboard' ? (
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName={cn('grow p-4', contentClassName)}>
        {children}
      </KeyboardAwareScrollView>
    ) : (
      <View className={cn('flex-1', contentClassName)}>{children}</View>
    );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-background', className)} {...props}>
      {offlineBanner ? <OfflineBanner /> : null}
      {content}
    </SafeAreaView>
  );
}
