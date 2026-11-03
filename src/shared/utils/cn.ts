import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Tell tailwind-merge about our custom font size, or it would treat `text-2xs` as a
// color and drop `text-foreground` next to it.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['2xs'] }] } },
});

/** Merges class names; a later class wins over an earlier one of the same kind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
