import { Tabs } from 'expo-router/js-tabs';
import { Bell, Globe, Menu, Warehouse } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { useUnreadNotificationCount } from '@/features/notifications';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { FloatingTabBar } from '@/shared/ui/floating-tab-bar';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

const WORDMARK = require('../../../../assets/images/splash-icon.png');
/** Matches `BrandLogo` wordmark proportions. */
const WORDMARK_RATIO = 430 / 120;

export default function TabsLayout() {
  const { t, i18n } = useTranslation();
  const unread = useUnreadNotificationCount();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShadowVisible: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.myGarage'),
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View
              className={cn(
                'items-center gap-2',
                i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row',
              )}>
              <Image
                accessibilityIgnoresInvertColors
                source={WORDMARK}
                resizeMode="contain"
                style={{ width: 72, height: 72 / WORDMARK_RATIO, tintColor: colors.foreground }}
              />
              <Text variant="h3">{t('tabs.myGarage')}</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        // A tab we can navigate to but don't list in the bar. `href: null` would make the
        // route unreachable (hidden tabs redirect), so only its bar button is hidden.
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
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t('tabs.menu'),
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
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
