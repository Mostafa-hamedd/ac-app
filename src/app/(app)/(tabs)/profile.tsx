import { useCurrentUser, useLogout } from '@/features/auth';
import { ProfileScreen } from '@/features/profile';

export default function ProfileRoute() {
  const user = useCurrentUser();
  const logout = useLogout();
  return (
    <ProfileScreen
      name={user?.name}
      email={user?.email}
      onSignOut={() => logout.mutate()}
      signingOut={logout.isPending}
    />
  );
}
