import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('uses the currency’s own number of decimals', () => {
    expect(formatCurrency(24999, 'USD', 'en')).toBe('$249.99');
    expect(formatCurrency(1500, 'JPY', 'en')).toBe('¥1,500');
    // Intl puts a non-breaking space after the code.
    expect(formatCurrency(12345, 'KWD', 'en')).toMatch(/^KWD\s12\.345$/);
  });
});

describe('formatDate', () => {
  it('shows a dash for an invalid date instead of "Invalid Date"', () => {
    expect(formatDate('not a date', 'en')).toBe('—');
  });
});
