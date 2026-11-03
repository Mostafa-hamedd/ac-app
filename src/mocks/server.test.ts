import { paginate } from './server';

describe('paginate', () => {
  const items = Array.from({ length: 7 }, (_, index) => index);

  it('returns the first page and a cursor to the next one', () => {
    expect(paginate(items, null, 3)).toEqual({ items: [0, 1, 2], nextCursor: '3' });
  });

  it('returns a middle page using the previous cursor', () => {
    expect(paginate(items, '3', 3)).toEqual({ items: [3, 4, 5], nextCursor: '6' });
  });

  it('returns the last partial page with a null cursor', () => {
    expect(paginate(items, '6', 3)).toEqual({ items: [6], nextCursor: null });
  });

  it('returns a null cursor when the page exactly fills the remaining items', () => {
    expect(paginate(items, '4', 3)).toEqual({ items: [4, 5, 6], nextCursor: null });
  });
});
