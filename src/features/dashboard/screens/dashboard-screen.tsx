import { Link, type Href } from 'expo-router';
import { Car, ChevronRight, ClipboardList, CreditCard, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

type Shortcut = { key: 'requests' | 'vehicles' | 'payments'; href: Href; icon: LucideIcon };

const SHORTCUTS: Shortcut[] = [
  { key: 'requests', href: '/requests', icon: ClipboardList },
  { key: 'vehicles', href: '/vehicles', icon: Car },
  { key: 'payments', href: '/payments', icon: CreditCard },
];

export function DashboardScreen({ userName }: { userName?: string }) {
  const { t } = useTranslation();
  const firstName = userName?.split(' ')[0];

  return (
    <Screen preset="scroll" edges={[]} contentClassName="gap-4">
      <View className="gap-1">
        <Text variant="h2">
          {firstName ? t('dashboard.greeting', { name: firstName }) : t('dashboard.welcomeBack')}
        </Text>
        <Text variant="muted">{t('dashboard.subtitle')}</Text>
      </View>

      {SHORTCUTS.map(({ key, href, icon: Icon }) => (
        <Link key={key} href={href} asChild>
          <Pressable accessibilityRole="button" className="active:opacity-80">
            <Card className="flex-row items-center gap-4">
              <View className="h-11 w-11 items-center justify-center rounded-md bg-muted">
                <Icon size={22} color={colors.foreground} />
              </View>
              <View className="flex-1">
                <Text variant="large">{t(`dashboard.${key}Title`)}</Text>
                <Text variant="muted">{t(`dashboard.${key}Description`)}</Text>
              </View>
              <ChevronRight size={20} color={colors['muted-foreground']} />
            </Card>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
