const { colors, radius, fontSize, fontFamily } = require('./src/theme/tokens');

const px = (value) => `${value}px`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // Replaced, not extended: only the sizes in tokens.js exist, so screens can't drift.
    fontSize: Object.fromEntries(
      Object.entries(fontSize).map(([name, [size, lineHeight]]) => [
        name,
        [px(size), px(lineHeight)],
      ]),
    ),
    // `font-sans-medium`, not `font-medium`: Tailwind's weight classes would also set
    // fontWeight, which makes Android fall back to the system font.
    fontFamily: {
      sans: [fontFamily.regular],
      'sans-medium': [fontFamily.medium],
      'sans-semibold': [fontFamily.semibold],
    },
    extend: {
      colors,
      borderRadius: {
        sm: px(radius.sm),
        md: px(radius.md),
        lg: px(radius.lg),
        sheet: px(radius.sheet),
      },
      spacing: {
        // Button height from the design.
        13: px(52),
        // Side padding of the car tabs.
        4.5: px(18),
      },
    },
  },
};
