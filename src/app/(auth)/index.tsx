import { LandingScreen } from '@/features/auth';

/**
 * Signed-out users' `/`. Renders Landing directly: a redirect here would add a blank
 * screen and an animated transition between the native splash and the intro. Lives in
 * the guarded (auth) group so it only exists while signed out; signed-in users get
 * (app)/(tabs)/index at `/` instead.
 */
export default LandingScreen;
