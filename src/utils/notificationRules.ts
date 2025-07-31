import { HourlyForecastItem } from '../hooks/useWeather';

export type RuleType = 'temperature' | 'precipitation' | 'humidity';

export interface Rule {
  type: RuleType;
  comparator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  durationHours: number;
}

/**
 * Evaluates a set of rules against a sequence of hourly weather data.
 * Each rule specifies a metric (e.g. temperature), a comparator, a threshold and
 * a minimum duration (in hours) that the condition must hold. All rules must
 * be satisfied for the function to return true (logical AND).
 *
 * @param rules Array of Rule definitions
 * @param data Hourly forecast data used for evaluation
 */
export function evaluateRules(rules: Rule[], data: HourlyForecastItem[]): boolean {
  return rules.every((rule) => {
    let count = 0;
    for (const item of data) {
      const value = getMetric(item, rule.type);
      if (value === undefined || !compare(value, rule.comparator, rule.threshold)) {
        // reset count if condition fails
        count = 0;
        continue;
      }
      count += 1;
      if (count >= rule.durationHours) {
        return true;
      }
    }
    return false;
  });
}

function getMetric(item: HourlyForecastItem, type: RuleType): number | undefined {
  switch (type) {
    case 'temperature':
      return item.temperature;
    case 'precipitation':
      return item.precipitation;
    case 'humidity':
      return item.humidity;
    default:
      return undefined;
  }
}

function compare(a: number, op: Rule['comparator'], b: number): boolean {
  switch (op) {
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '==':
      return a === b;
    default:
      return false;
  }
}