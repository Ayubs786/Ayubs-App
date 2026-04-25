import { isAuthenticated } from '@/lib/auth';
import LoginScreen from './components/LoginScreen';
import DailyCompanion from './components/DailyCompanion';

export default function Page() {
  const authed = isAuthenticated();
  if (!authed) {
    return <LoginScreen />;
  }
  return <DailyCompanion />;
}
