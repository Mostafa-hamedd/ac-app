import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { i18n, restoreLanguage } from '@/lib/i18n';
import { getSplashLogoWidth } from '@/shared/ui/app-splash';

import { LandingScreen } from './landing-screen';

// Screen's native keyboard and offline-banner dependencies aren't relevant to this test.
jest.mock('@/shared/ui/screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
}));

// Reanimated's own mock can't initialize under Jest here, and motion isn't what's tested.
jest.mock('react-native-reanimated', () => {
  const { Image, View } = jest.requireActual('react-native');
  const identity = (value: unknown) => value;
  return {
    __esModule: true,
    default: { Image, View },
    Easing: { out: identity, cubic: identity, bezier: () => identity },
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (value: unknown) => ({ get: () => value, set: () => undefined }),
    withDelay: (_delay: number, animation: unknown) => animation,
    withTiming: identity,
  };
});

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

describe('getSplashLogoWidth', () => {
  it('fills the design width on phones and caps on tablets and unfolded foldables', () => {
    expect(getSplashLogoWidth(390)).toBeCloseTo(371);
    expect(getSplashLogoWidth(1024)).toBe(480);
  });
});

describe('LandingScreen language toggle', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('switches to Arabic, saves the choice, and offers English back', async () => {
    await render(<LandingScreen />);
    expect(screen.getByText('Create account')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Switch language to Arabic'));

    await waitFor(() => expect(screen.getByText('إنشاء حساب')).toBeTruthy());
    expect(screen.getByText('English')).toBeTruthy();
    expect(await AsyncStorage.getItem('autoconnect.pref.language')).toBe('"ar"');
  });

  it('restores the saved language', async () => {
    await AsyncStorage.setItem('autoconnect.pref.language', '"ar"');
    await restoreLanguage();
    expect(i18n.language).toBe('ar');
  });
});
