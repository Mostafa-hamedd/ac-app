import { Tabs } from 'expo-router/js-tabs';
import { Bell, Globe, Menu, Warehouse } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useUnreadNotificationCount } from '@/features/notifications';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { FloatingTabBar } from '@/shared/ui/floating-tab-bar';

export default function TabsLayout() {
  const { t } = useTranslation();
  const unread = useUnreadNotificationCount();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShadowVisible: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} />,
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
