import { renderHook } from '@testing-library/react-native';

import { i18n } from '@/lib/i18n';

import { useTextAlign } from './use-text-align';

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('useTextAlign', () => {
  it('adds no alignment classes in English', async () => {
    await i18n.changeLanguage('en');
    const { result } = await renderHook(() => useTextAlign());
    expect(result.current).toBe('');
  });

  it('right-aligns text in Arabic', async () => {
    await i18n.changeLanguage('ar');
    const { result } = await renderHook(() => useTextAlign());
    expect(result.current).toBe('self-end text-right');
  });
});
