import { type ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/** Notifications tab mark from the design (17 × 20 grid). */
export function NotificationsTabIcon({ size = 20, color }: { size?: number; color: ColorValue }) {
  const width = (size * 17) / 20;
  const fill = typeof color === 'string' ? color : colors.foreground;
  return (
    <Svg width={width} height={size} viewBox="0 0 17 20" fill="none">
      <Path
        fill={fill}
        d="M15.71 15H14.46V9.25C14.46 6.06 12.06 3.43 8.97 3.05V0.75C8.97 0.34 8.63 0 8.22 0C7.81 0 7.47 0.34 7.47 0.75V3.05C4.38 3.42 1.97 6.06 1.97 9.25V15H0.75C0.34 15 0 15.34 0 15.75C0 16.16 0.34 16.5 0.75 16.5H4.53C4.77 18.33 6.33 19.75 8.22 19.75C10.11 19.75 11.67 18.33 11.91 16.5H15.71C16.12 16.5 16.46 16.16 16.46 15.75C16.46 15.34 16.13 15 15.71 15ZM3.47 9.25C3.47 6.63 5.6 4.5 8.22 4.5C10.84 4.5 12.96 6.63 12.96 9.25V15H3.47V9.25ZM8.22 18.25C7.15 18.25 6.26 17.5 6.04 16.5H10.41C10.18 17.5 9.29 18.25 8.22 18.25Z"
      />
    </Svg>
  );
}
