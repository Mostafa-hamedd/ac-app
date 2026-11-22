import { leaveGuestMode, useCurrentUser, useIsGuest, useLogout } from '@/features/auth';
import { ProfileScreen } from '@/features/profile';

export default function ProfileRoute() {
  const user = useCurrentUser();
  const logout = useLogout();
  const isGuest = useIsGuest();
  return (
    <ProfileScreen
      name={user?.name}
      email={user?.email}
      onSignOut={() => logout.mutate()}
      signingOut={logout.isPending}
      isGuest={isGuest}
      onLogin={leaveGuestMode}
    />
  );
}
