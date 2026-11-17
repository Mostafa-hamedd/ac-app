import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Tell tailwind-merge about our custom font sizes, or it would treat `text-caption` as a
// color and drop `text-foreground` next to it.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: { 'font-size': [{ text: ['2xs', 'caption', 'compact', 'subhead', 'title'] }] },
  },
});

/** Merges class names; a later class wins over an earlier one of the same kind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
