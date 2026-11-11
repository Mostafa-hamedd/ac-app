import { fireEvent, render, screen } from '@testing-library/react-native';

import { i18n } from '@/lib/i18n';

import { WeekCalendar } from './week-calendar';

// Wednesday 18 November 2026.
const TODAY = new Date(2026, 10, 18, 14, 30);

afterEach(async () => {
  await i18n.changeLanguage('en');
});

const dayButtons = () => screen.getAllByRole('button');

describe('WeekCalendar', () => {
  it('shows the month, the weekday labels and two weeks of days', async () => {
    await render(<WeekCalendar value={null} onChange={jest.fn()} today={TODAY} />);
    expect(screen.getByText('November 2026')).toBeTruthy();
    for (const weekday of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByText(weekday)).toBeTruthy();
    }
    expect(dayButtons()).toHaveLength(14);
  });

  it('starts on the Sunday of the current week', async () => {
    await render(<WeekCalendar value={null} onChange={jest.fn()} today={TODAY} />);
    expect(dayButtons()[0]!.props.accessibilityLabel).toBe('Sunday, November 15');
    expect(dayButtons()[13]!.props.accessibilityLabel).toBe('Saturday, November 28');
  });

  it('disables the days before today and allows today onwards', async () => {
    await render(<WeekCalendar value={null} onChange={jest.fn()} today={TODAY} />);
    const disabled = (label: string) =>
      screen.getByLabelText(label).props.accessibilityState.disabled;
    expect(disabled('Sunday, November 15')).toBe(true);
    expect(disabled('Tuesday, November 17')).toBe(true);
    expect(disabled('Wednesday, November 18')).toBe(false);
    expect(disabled('Saturday, November 28')).toBe(false);
  });

  it('reports the picked day and ignores disabled days', async () => {
    const onChange = jest.fn();
    await render(<WeekCalendar value={null} onChange={onChange} today={TODAY} />);
    await fireEvent.press(screen.getByLabelText('Monday, November 16'));
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByLabelText('Friday, November 20'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 10, 20]);
  });

  it('marks only the selected day', async () => {
    await render(
      <WeekCalendar value={new Date(2026, 10, 20)} onChange={jest.fn()} today={TODAY} />,
    );
    const selected = dayButtons().filter((day) => day.props.accessibilityState.selected);
    expect(selected).toHaveLength(1);
    expect(selected[0]!.props.accessibilityLabel).toBe('Friday, November 20');
  });

  it('can show more weeks', async () => {
    await render(<WeekCalendar value={null} onChange={jest.fn()} today={TODAY} weeks={3} />);
    expect(dayButtons()).toHaveLength(21);
  });

  it('is shown in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<WeekCalendar value={null} onChange={jest.fn()} today={TODAY} />);
    expect(screen.queryByText('November 2026')).toBeNull();
    expect(dayButtons()).toHaveLength(14);
  });
});
