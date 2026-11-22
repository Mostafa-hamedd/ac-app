import { Stack } from 'expo-router';

import { colors } from '@/theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Forms use app background (#F5F5F5); only landing overrides to black.
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{ animation: 'none', contentStyle: { backgroundColor: colors.primary } }}
      />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="upload-documents" />
      <Stack.Screen name="verifying" />
      <Stack.Screen name="verifying-failed" />
      <Stack.Screen name="verifying-done" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
