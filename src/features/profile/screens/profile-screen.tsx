import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { setLanguage } from '@/lib/i18n';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

type ProfileScreenProps = {
  name?: string;
  email?: string;
  onSignOut: () => void;
  signingOut?: boolean;
};

/**
 * Presentational: the route passes in the session and sign-out from the auth feature,
 * so profile doesn't depend on auth's internals.
 */
export function ProfileScreen({ name, email, onSignOut, signingOut }: ProfileScreenProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Screen preset="scroll" edges={[]} contentClassName="gap-4">
      <Card>
        <View className="gap-1">
          <Text variant="large">{name ?? t('profile.yourAccount')}</Text>
          {email ? <Text variant="muted">{email}</Text> : null}
        </View>
      </Card>

      <Card className="flex-row items-center justify-between">
        <Text variant="small">{t('profile.language')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void setLanguage(isArabic ? 'en' : 'ar')}
          className="rounded-full bg-muted px-3 py-1.5 active:opacity-80">
          {/* Each label stays in its own language so people can always find theirs. */}
          <Text variant="small">{isArabic ? 'English' : 'العربية'}</Text>
        </Pressable>
      </Card>

      <Button variant="outline" onPress={onSignOut} loading={signingOut}>
        {t('profile.signOut')}
      </Button>
    </Screen>
  );
}
