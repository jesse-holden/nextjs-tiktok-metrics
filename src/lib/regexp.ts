import { formatTikTokNumbers } from '@/lib/formatters';
import { TikTokVideoMetrics } from '@/lib/scrapers';

export const tikTokVideoStatsRegExpMap = {
  comments: /data-e2e="comment-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
  shares: /data-e2e="share-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
  likes: /data-e2e="like-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
};

export function getMetricCountFromRegExp(
  selector: RegExp,
  searchBody: string
): number {
  const [, count] = searchBody.match(selector) || [];
  return formatTikTokNumbers(count ?? 0);
}

export function getNthRegExpMatch(
  searchBody: string,
  selector: RegExp,
  n: number
): string {
  const matches = searchBody.match(selector) || [];
  return matches ? matches[n] : '';
}

export function getFirstRegExpMatch(
  searchBody: string,
  selector: RegExp
): string {
  return getNthRegExpMatch(searchBody, selector, 1);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any
export function getAllRegExpMatch(
  searchBody: string,
  selector: RegExp,
  mapfn: (match: string[]) => string = (match) => match[0],
  limit?: number
): Array<string> {
  const matches = searchBody.matchAll(selector);
  const [...items] = matches
    ? Array.from(matches as unknown as ArrayLike<string[]>, mapfn)
    : [];

  return limit ? items.slice(0, limit) : items;
}

export function getTikTokVideoStatsFromRegExp(
  searchBody: string
): TikTokVideoMetrics {
  return Object.entries(tikTokVideoStatsRegExpMap).reduce(
    (acc, [key, regexp]) => ({
      ...acc,
      [key]: getMetricCountFromRegExp(regexp, searchBody),
    }),
    {} as { [key in keyof typeof tikTokVideoStatsRegExpMap]: number }
  );
}
