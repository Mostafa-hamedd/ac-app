import { render, screen } from '@testing-library/react-native';

import { colors } from '@/theme';

import { MenuTabIcon } from './menu-tab-icon';

describe('MenuTabIcon', () => {
  it('renders the three-bar mark at the requested size, keeping the 21 x 16 proportions', async () => {
    await render(<MenuTabIcon size={42} color={colors.foreground} />);
    const svg = screen.toJSON() as { props: Record<string, number> };
    expect(svg.props.width).toBe(42);
    expect(svg.props.height).toBe(32);
    expect(svg.props.vbWidth).toBe(21);
    expect(svg.props.vbHeight).toBe(16);
  });
});
