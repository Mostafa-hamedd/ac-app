import { Tabs } from 'expo-router/js-tabs';
import { Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuTabIcon } from '@/features/menu/components/menu-tab-icon';
import { GarageTabIcon } from '@/features/my-garage/components/garage-tab-icon';
import { useUnreadNotificationCount } from '@/features/notifications';
import { NotificationsTabIcon } from '@/features/notifications/components/notifications-tab-icon';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { FloatingTabBar } from '@/shared/ui/floating-tab-bar';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

const WORDMARK = require('../../../../assets/images/splash-icon.png');
/** Matches `BrandLogo` wordmark proportions. */
const WORDMARK_RATIO = 430 / 120;
/** My Garage header height below the status bar. */
const HEADER_HEIGHT = 60;

/** Wordmark and screen title shown at the top of My Garage. */
function GarageTitle() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  return (
    <View className={cn('items-center gap-2', isArabic ? 'flex-row-reverse px-4' : 'flex-row')}>
      <Image
        accessibilityIgnoresInvertColors
        source={WORDMARK}
        resizeMode="contain"
        style={{ width: 72, height: 72 / WORDMARK_RATIO, tintColor: colors.foreground }}
      />
      <Text variant="h2">{t('tabs.myGarage')}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const insets = useSafeAreaInsets();
  const unread = useUnreadNotificationCount();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShadowVisible: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.myGarage'),
          headerStyle: { height: insets.top + HEADER_HEIGHT },
          headerTitleAlign: 'left',
          headerTitle: isArabic ? '' : () => <GarageTitle />,
          headerRight: isArabic ? () => <GarageTitle /> : undefined,
          tabBarIcon: ({ color, size }) => <GarageTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          headerShown: false,
          title: t('services.title'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="book-service"
        options={{
          headerShown: false,
          title: t('services.bookScreenTitle'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="book-new-service"
        options={{
          headerShown: false,
          title: t('services.bookScreenTitle'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="payment-details"
        options={{
          headerShown: false,
          title: t('payments.title'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="payment-success"
        options={{
          headerShown: false,
          title: t('payments.result.successTitle'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="payment-failed"
        options={{
          headerShown: false,
          title: t('payments.result.failedTitle'),
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color, size }) => <Globe color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.notifications'),
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: ({ color, size }) => <NotificationsTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t('tabs.menu'),
          tabBarIcon: ({ color, size }) => <MenuTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="brand"
        options={{
          title: t('tabs.brand'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <BrandLogo color={color} size={focused ? 32 : 36} ringed={!focused} />
          ),
        }}
      />
    </Tabs>
  );
}
