import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

/** App-wide providers, outermost first. Feature-specific providers don't belong here. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryProvider>
            <ThemeProvider>
              <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
            </ThemeProvider>
          </QueryProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
