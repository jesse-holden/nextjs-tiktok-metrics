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

export function calcCreatorInteractionRate(
  commentCount: number,
  likesCount: number,
  sharesCount: number,
  viewsCount: number
): number {
  return Number(
    ((commentCount + likesCount + sharesCount) / viewsCount).toFixed(2)
  );
}

export function calcArrayAvg(array: number[]): number {
  return array.reduce((a, b) => a + b, 0) / array.length;
}

export function calcAvg(value: number, total: number, floor?: boolean): number {
  const avg = value / total;
  return floor ? Math.floor(avg) : avg;
}
