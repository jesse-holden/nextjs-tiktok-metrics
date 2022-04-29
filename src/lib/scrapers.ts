import { calcAvg } from '@/lib/formatters';
import {
  getAllRegExpMatch,
  getFirstRegExpMatch,
  getTikTokVideoStatsFromRegExp,
} from '@/lib/regexp';
import cacheStore from '@/lib/stores';
import { fetchTikTokURL } from '@/lib/tiktok-helpers';

export type TikTokVideoMetrics = {
  comments: number;
  likes: number;
  shares: number;
};

export async function scrapeTikTokPage(
  url: string
): Promise<{ body: string | null; cached: boolean }> {
  const cached = await cacheStore.get(url);
  let body = cached;

  if (!cached) {
    // Set cookie here if running into scraping errors
    // await setCookie('sid_tt=abc123', '.tiktok.com');
    // await setCookie(
    //   'sessionid=abc123',
    //   '.tiktok.com'
    // );
    const Tok = await fetchTikTokURL(url);
    body = Tok?.body;
    if (body) {
      await cacheStore.set(url, body);
    }
  }

  try {
    if (body) {
      if (
        (body.match(/const option = {"title":"tiktok-verify-page"/) || [])
          .length
      ) {
        // await removeAllCookies();
        throw new Error('Verification page detected. Please try again later.');
      }
    }
  } catch (err) {
    await cacheStore.delete(url);
    throw err;
  }

  return { body: body ?? null, cached: !!cached };
}

export async function getTikTokVideoStats(url: string): Promise<{
  data: TikTokVideoMetrics;
  cached: boolean;
}> {
  const { body, cached } = await scrapeTikTokPage(url);

  if (!body)
    return {
      data: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      cached,
    };

  return {
    data: getTikTokVideoStatsFromRegExp(body),
    cached,
  };
}

const emptyStats = Object.freeze({
  likes: 0,
  comments: 0,
  shares: 0,
});

export async function scrapeNewestTikTokVideoStats(
  username: string,
  count = 10
): Promise<TikTokVideoMetrics> {
  const { body } = await scrapeTikTokPage(
    `https://www.tiktok.com/${username}?lang=en`
  );

  if (!body) return emptyStats;

  const tikTokNewestVideoIdsGroup = getFirstRegExpMatch(
    body,
    /{"user-post":{"list":\[(.*)\]/
  );

  if (!tikTokNewestVideoIdsGroup) return emptyStats;

  const tikTokNewestVideoIds = getAllRegExpMatch(
    tikTokNewestVideoIdsGroup,
    /\d{19}/g,
    (m) => m[0],
    count
  );

  if (tikTokNewestVideoIds.length !== count) {
    return emptyStats;
  }

  const stats = {
    likes: 0,
    comments: 0,
    shares: 0,
  };

  for (const videoId of tikTokNewestVideoIds) {
    const videoURL = `https://www.tiktok.com/${username}/video/${videoId}`;
    const {
      data: { comments, shares, likes },
      cached,
    } = await getTikTokVideoStats(videoURL);
    if (!cached) {
      // eslint-disable-next-line no-console
      console.log('fetched', videoURL);
      // eslint-disable-next-line no-console
      console.log('waiting before next fetch...');
      // wait 1 to 2 seconds
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(1000, Math.random() * 2000))
      );
    }
    stats.likes += likes;
    stats.comments += comments;
    stats.shares += shares;
  }

  // Average all of the stats
  return Object.entries(stats).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: calcAvg(value, count, true),
    }),
    {} as TikTokVideoMetrics
  );
}
