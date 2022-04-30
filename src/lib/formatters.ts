import { TikTokVideoMetrics } from '@/lib/scrapers';

/**
 * Takes a string scraped from TikTok and converts it to a number
 * @param value Input value (ie. 5.3M, 3.2K, 6000, etc.)
 */
export function formatTikTokNumbers(value: string | number): number {
  if (!value) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  // Converts strings like "5.3M" to a number
  const number = Number(value.replace(/[^0-9.]+/g, ''));
  const unit = value.replace(/[0-9.]+/g, '');

  switch (unit) {
    case 'K':
      return number * 1000;
    case 'M':
      return number * 1000_000;
    case 'B':
      return number * 1000_000_000;
    default:
      return number;
  }
}

export function calcAvg(value: number, total: number, floor?: boolean): number {
  const avg = value / total;
  return floor ? Math.floor(avg) : avg;
}

export function sum(...values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function calcArrayAvg(array: number[], floor?: boolean): number {
  return calcAvg(
    array.reduce((a, b) => a + b, 0),
    array.length,
    floor
  );
}

export function parseNum(value: string | number): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function calcInteractionRate(
  metrics: TikTokVideoMetrics,
  views: number
): number {
  const rate = Number(
    (sum(metrics.comments, metrics.likes, metrics.shares) / views).toFixed(2)
  );

  return parseNum(rate);
}

export function formatTikTokUsername(username: string): string {
  return username.startsWith('@') ? username : `@${username}`;
}

export const stringToLocaleString = (value: number | string): string => {
  return parseNum(value).toLocaleString();
};

export const floatToPercentString = (value: number | string): string => {
  return `${parseNum(value)} %`;
};
