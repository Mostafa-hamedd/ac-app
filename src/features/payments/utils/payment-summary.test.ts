import { buildPaymentSummary, TAXES_AND_FEES } from './payment-summary';

describe('buildPaymentSummary', () => {
  it('splits the cost into lines that add up to the subtotal', () => {
    const summary = buildPaymentSummary(12000);
    expect(summary.lines.map((line) => line.amount)).toEqual([7200, 3600, 1200]);
    expect(summary.lines.reduce((sum, line) => sum + line.amount, 0)).toBe(12000);
    expect(summary.subtotal).toBe(12000);
  });

  it('adds taxes and fees to the total', () => {
    const summary = buildPaymentSummary(800);
    expect(summary.taxesAndFees).toBe(TAXES_AND_FEES);
    expect(summary.total).toBe(850);
  });

  it('keeps the lines adding up when the split does not divide evenly', () => {
    const summary = buildPaymentSummary(901);
    expect(summary.lines.reduce((sum, line) => sum + line.amount, 0)).toBe(901);
  });
});
