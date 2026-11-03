import { useCurrentUser } from '@/features/auth';
import { DashboardScreen } from '@/features/dashboard';

export default function DashboardRoute() {
  const user = useCurrentUser();
  return <DashboardScreen userName={user?.name} />;
}
