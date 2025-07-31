import { evaluateRules, Rule } from './notificationRules';
import { HourlyForecastItem } from '../hooks/useWeather';

describe('notification rule evaluation', () => {
  const sampleData: HourlyForecastItem[] = [
    { time: '2025-07-31T00:00', temperature: 20, precipitation: 0, humidity: 60 },
    { time: '2025-07-31T01:00', temperature: 26, precipitation: 0, humidity: 55 },
    { time: '2025-07-31T02:00', temperature: 27, precipitation: 0, humidity: 50 },
    { time: '2025-07-31T03:00', temperature: 28, precipitation: 0, humidity: 50 },
    { time: '2025-07-31T04:00', temperature: 30, precipitation: 6, humidity: 45 },
    { time: '2025-07-31T05:00', temperature: 24, precipitation: 7, humidity: 40 },
  ];

  test('temperature > 25°C for >= 3 hours returns true', () => {
    const rules: Rule[] = [
      { type: 'temperature', comparator: '>', threshold: 25, durationHours: 3 },
    ];
    expect(evaluateRules(rules, sampleData)).toBe(true);
  });

  test('precipitation >= 5 mm for >= 2 hours returns true', () => {
    const rules: Rule[] = [
      { type: 'precipitation', comparator: '>=', threshold: 5, durationHours: 2 },
    ];
    expect(evaluateRules(rules, sampleData)).toBe(true);
  });

  test('temperature > 30°C for >= 2 hours returns false', () => {
    const rules: Rule[] = [
      { type: 'temperature', comparator: '>', threshold: 30, durationHours: 2 },
    ];
    expect(evaluateRules(rules, sampleData)).toBe(false);
  });

  test('multiple rules combined with AND must all pass', () => {
    const rules: Rule[] = [
      { type: 'temperature', comparator: '>', threshold: 25, durationHours: 2 },
      { type: 'precipitation', comparator: '>=', threshold: 6, durationHours: 1 },
    ];
    expect(evaluateRules(rules, sampleData)).toBe(true);
  });
});