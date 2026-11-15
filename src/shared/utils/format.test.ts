import { formatDate } from './format';

describe('formatDate', () => {
  it('shows a dash for an invalid date instead of "Invalid Date"', () => {
    expect(formatDate('not a date', 'en')).toBe('—');
  });
});
