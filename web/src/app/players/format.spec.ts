import { formatStat } from './format';

describe('formatStat', () => {
  it.each([
    [26, 'integer', '26'],
    [9.14, 'decimal', '9.1'],
    [0.4213, 'percent', '42.1%'],
    [1, 'percent', '100.0%'],
    [-0.7, 'signed', '-0.7'],
    [1.25, 'signed', '+1.3'],
    [0, 'signed', '0.0'],
  ] as const)('formats %s as %s', (value, format, expected) => {
    expect(formatStat(value, format)).toBe(expected);
  });

  it('shows a dash for a missing value', () => {
    expect(formatStat(null, 'decimal')).toBe('—');
  });
});
