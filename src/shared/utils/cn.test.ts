import { cn } from './cn';

describe('cn', () => {
  it('joins class names and skips falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('lets a later class win over an earlier one of the same kind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps a custom font size next to a text color instead of dropping the color', () => {
    expect(cn('text-foreground', 'text-caption')).toBe('text-foreground text-caption');
    expect(cn('text-caption', 'text-subhead')).toBe('text-subhead');
  });
});
