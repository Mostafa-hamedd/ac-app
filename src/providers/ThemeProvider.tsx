import { DefaultTheme, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

/** Gives navigation headers, tab bars and screen backgrounds the app's colors. */
const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.foreground,
    border: colors.border,
    notification: colors.destructive,
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style="dark" />
      {children}
    </NavigationThemeProvider>
  );
}
