/**
 * Design tokens: the single source of truth for colors, radii, font sizes and fonts.
 * Used by tailwind.config.js (class names like `bg-primary`) and by app code through
 * src/theme/index.ts (for props that can't take a class name, like icon colors).
 *
 * Plain CommonJS because tailwind.config.js loads it in Node.
 * The app is light-only. Add a dark palette here when a dark design exists.
 */

const colors = {
  // Brand
  primary: '#0B0B0C',
  'primary-foreground': '#FFFFFF',

  // Surfaces and text
  background: '#F5F5F5',
  foreground: '#0B0B0C',
  card: '#FFFFFF',
  'card-foreground': '#0B0B0C',
  muted: '#EDEDED',
  'muted-foreground': '#717171',
  placeholder: '#999999',
  border: '#E2E2E2',
  input: '#0B0B0C',
  link: '#007AFF',

  // Status
  destructive: '#B50000',
  'destructive-foreground': '#FFFFFF',
  'destructive-soft': '#FCDCDC',
  success: '#15803D',
  'success-foreground': '#FFFFFF',
  warning: '#B45309',
  'warning-foreground': '#FFFFFF',
  info: '#0369A1',
  'info-foreground': '#FFFFFF',
};

/** In dp. */
const radius = {
  sm: 6,
  md: 10,
  lg: 15,
  /** Top corners of the landing screen's sliding sheet. */
  sheet: 40,
  full: 9999,
};

/** [size, line height] in dp. */
const fontSize = {
  '2xs': [10, 14],
  xs: [12, 18],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 27],
  xl: [20, 28],
  '2xl': [26, 39],
};

/** Each weight is its own font file in React Native, so weights are picked by family. */
const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
};

module.exports = { colors, radius, fontSize, fontFamily };
