import { calculateRSI } from './App';

describe('calculateRSI Function', () => {
  test('calculates RSI correctly for sufficient data', () => {
    const prices = Array(15).fill(100).map((v, i) => v + i); // [100, 101, 102, ..., 114]
    const rsi = calculateRSI(prices);
    expect(rsi).toBeCloseTo(100, 1); // All gains, RSI should be near 100
  });

  test('returns 0 for insufficient data', () => {
    const prices = [100, 101, 102];
    const rsi = calculateRSI(prices);
    expect(rsi).toBe(0);
  });

  test('handles mixed gains and losses', () => {
    const prices = [100, 102, 100, 103, 101, 100, 102, 104, 103, 105, 106, 107, 108, 109, 110];
    const rsi = calculateRSI(prices);
    expect(rsi).toBeGreaterThan(50); // More gains than losses
  });
});