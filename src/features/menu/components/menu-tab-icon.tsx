import { type ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/** Menu tab mark from the design (21 × 16 grid). */
export function MenuTabIcon({ size = 20, color }: { size?: number; color: ColorValue }) {
  const height = (size * 16) / 21;
  const fill = typeof color === 'string' ? color : colors.foreground;
  return (
    <Svg width={size} height={height} viewBox="0 0 21 16" fill="none">
      <Path
        fill={fill}
        d="M19.6214 1.75714H0.878571C0.398286 1.75714 0 1.35886 0 0.878571C0 0.398286 0.398286 0 0.878571 0H19.6214C20.1017 0 20.5 0.398286 20.5 0.878571C20.5 1.35886 20.1017 1.75714 19.6214 1.75714ZM20.5 7.90714C20.5 7.42686 20.1017 7.02857 19.6214 7.02857H0.878571C0.398286 7.02857 0 7.42686 0 7.90714C0 8.38743 0.398286 8.78571 0.878571 8.78571H19.6214C20.1017 8.78571 20.5 8.38743 20.5 7.90714ZM20.5 14.9357C20.5 14.4554 20.1017 14.0571 19.6214 14.0571H0.878571C0.398286 14.0571 0 14.4554 0 14.9357C0 15.416 0.398286 15.8143 0.878571 15.8143H19.6214C20.1017 15.8143 20.5 15.416 20.5 14.9357Z"
      />
    </Svg>
  );
}
