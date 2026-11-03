import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { setLanguage } from '@/lib/i18n';
import {
  getSplashLogoWidth,
  NATIVE_SPLASH_LOGO_WIDTH,
  SPLASH_LOGO_ASPECT,
} from '@/shared/ui/app-splash';
import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

const LOGO_GROW_MS = 350;
const SPLASH_HOLD_MS = 450;
const SHEET_SLIDE_MS = 650;

// The intro belongs to app launch: going back to this screen or signing out must not replay it.
const intro = { played: false };

/**
 * The intro continues the native splash: the logo starts where the splash left it,
 * then the white sheet slides up while the logo moves to its landing position.
 * Vertical gaps are flex ratios of the 390x844 design, so they scale on other screens.
 */
export function LandingScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useSafeAreaFrame();
  const isArabic = i18n.language === 'ar';
  const textAlign = useTextAlign();

  const reducedMotion = useReducedMotion();
  const [playIntro] = useState(() => !intro.played && !reducedMotion);
  const logoGrow = useSharedValue(playIntro ? 0 : 1);
  const slide = useSharedValue(playIntro ? 0 : 1);

  useEffect(() => {
    intro.played = true;
    if (!playIntro) return;
    logoGrow.set(withTiming(1, { duration: LOGO_GROW_MS, easing: Easing.out(Easing.cubic) }));
    slide.set(
      withDelay(
        LOGO_GROW_MS + SPLASH_HOLD_MS,
        withTiming(1, { duration: SHEET_SLIDE_MS, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
      ),
    );
  }, [playIntro, logoGrow, slide]);

  const logoWidth = getSplashLogoWidth(width);
  const logoHeight = logoWidth / SPLASH_LOGO_ASPECT;
  const isLogoCapped = logoWidth < width * (371 / 390);
  const logoLeft = isLogoCapped ? (width - logoWidth) / 2 : width * (19 / 390);
  const logoTop = height * (163 / 844);
  // Distance from the landing position back to the splash position (screen center).
  const logoOffsetX = (width - logoWidth) / 2 - logoLeft;
  const logoOffsetY = (height - logoHeight) / 2 - logoTop;
  const logoStartScale = NATIVE_SPLASH_LOGO_WIDTH / logoWidth;

  const logoStyle = useAnimatedStyle(() => {
    const remaining = 1 - slide.get();
    return {
      transform: [
        { translateX: logoOffsetX * remaining },
        { translateY: logoOffsetY * remaining },
        { scale: logoStartScale + (1 - logoStartScale) * logoGrow.get() },
      ],
    };
  });
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height * (1 - slide.get()) }],
  }));
  const languageStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, (slide.get() - 0.6) / 0.4),
  }));

  return (
    <Screen preset="fixed" edges={[]} offlineBanner={false} className="bg-primary">
      {/* Overrides the app-wide StatusBar for this screen only (black header below); reverts on navigation away. */}
      <StatusBar style="light" />
      <View className="flex-[383]">
        <Animated.Image
          source={require('@/assets/images/splash-icon.png')}
          resizeMode="contain"
          style={[
            {
              position: 'absolute',
              top: logoTop,
              left: logoLeft,
              width: logoWidth,
              height: logoHeight,
            },
            logoStyle,
          ]}
        />
        <Animated.View
          style={[{ position: 'absolute', top: insets.top + 14, right: 24 }, languageStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('landing.switchLanguage')}
            hitSlop={8}
            onPress={() => void setLanguage(isArabic ? 'en' : 'ar')}
            className="h-7 min-w-13 items-center justify-center rounded-full bg-card px-3 active:opacity-80">
            {/* Each label stays in its own language so people can always find theirs. */}
            <Text className="font-sans-medium text-xs">{isArabic ? 'English' : 'العربية'}</Text>
          </Pressable>
        </Animated.View>
      </View>
      <Animated.View style={[{ flex: 461 }, sheetStyle]}>
        <View
          style={{ paddingBottom: insets.bottom }}
          className="flex-1 rounded-t-sheet bg-card px-6">
          <View className="flex-[70]" />
          <View className="gap-2">
            <Text className={cn('text-base', textAlign)}>{t('landing.welcome')}</Text>
            <Text className={cn('font-sans-medium text-2xl', textAlign)}>
              {t('landing.appName')}
            </Text>
          </View>
          <View className="flex-[93]" />
          <View className="gap-2.5">
            <Link href="/register" asChild>
              <Button>{t('landing.createAccount')}</Button>
            </Link>
            <Link href="/login" asChild>
              <Button variant="secondary">{t('landing.login')}</Button>
            </Link>
          </View>
          <View className="flex-[88]" />
        </View>
      </Animated.View>
    </Screen>
  );
}
