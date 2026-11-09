import { type ColorValue, Image, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

const WORDMARK = require('../../../assets/images/splash-icon.png');

/** The wordmark's width / height, so it keeps its proportions at any size. */
const WORDMARK_RATIO = 430 / 120;

type BrandLogoProps = {
  /** Colour of the (single-colour) wordmark. */
  color: ColorValue;
  /** Diameter of the ring around the logo. */
  size?: number;
  /** Draws a thin ring around the logo. */
  ringed?: boolean;
  className?: string;
};

/** The AutoConnect wordmark, optionally inside a circular ring (used as the last tab icon). */
export function BrandLogo({ color, size = 36, ringed = false, className }: BrandLogoProps) {
  const width = size * 0.72;
  return (
    <View
      accessibilityElementsHidden
      className={cn('items-center justify-center rounded-full', ringed && 'border', className)}
      style={{ width: size, height: size, borderColor: color }}>
      <Image
        source={WORDMARK}
        resizeMode="contain"
        style={{ width, height: width / WORDMARK_RATIO, tintColor: color }}
      />
    </View>
  );
}
