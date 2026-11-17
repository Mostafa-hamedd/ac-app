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
  foreground: '#0F172A',
  card: '#FFFFFF',
  /** Background of bottom sheets. */
  sheet: '#F5F5F5',
  'card-foreground': '#0F172A',
  muted: '#EDEDED',
  /** Backdrop behind vehicle photos and illustrations. */
  photo: '#D9D9D9',
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
  /** The Upcoming status. */
  gold: '#B8860B',
  'info-foreground': '#FFFFFF',
};

/** In dp. */
const radius = {
  /** Cards and compact buttons in the My Garage design. */
  xs: 8,
  sm: 6,
  md: 10,
  lg: 15,
  /** Top corners of the landing screen's sliding sheet. */
  sheet: 40,
  full: 9999,
};

/** Width of every border (the `border` class), in dp. */
const borderWidth = 1.5;

/** [size, line height] in dp. */
const fontSize = {
  '2xs': [10, 14],
  /** Small captions in the My Garage cards. */
  caption: [11, 16],
  xs: [12, 18],
  /** Checklist steps and the help link. */
  compact: [13, 19],
  sm: [14, 20],
  /** Card titles and amounts. */
  subhead: [15, 22],
  base: [16, 24],
  lg: [18, 27],
  xl: [20, 28],
  title: [22, 33],
  '2xl': [26, 39],
};

/**
 * Each weight is its own font file in React Native, so weights are picked by family.
 * These are the fonts' PostScript names (files in assets/fonts, embedded by the expo-font
 * plugin in app.json): iOS only resolves a custom font by that name.
 */
const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
};

module.exports = { colors, radius, borderWidth, fontSize, fontFamily };
