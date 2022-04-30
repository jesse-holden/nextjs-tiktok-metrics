import { calcAvg } from '@/lib/formatters';
import {
  getAllRegExpMatch,
  getFirstRegExpMatch,
  getTikTokVideoStatsFromRegExp,
} from '@/lib/regexp';
import cacheStore from '@/lib/stores';
import { fetchTikTokURL } from '@/lib/tiktok-helpers';

export const tikTokCacheKeys = {
  page: 'tiktok-page', // HTML page (string)
  pageTs: 'tiktok-page-loaded', // Timestamp when the page was loaded
  videoStats: 'tiktok-video-stats', // Video stats (TikTokVideoMetrics)
  videosStatsTs: 'tiktok-videos-loaded', // Timestamp when the videos were loaded
};

export type TikTokVideoMetrics = {
  comments: number;
  likes: number;
  shares: number;
};

export async function scrapeTikTokPage(
  url: string
): Promise<{ body: string | null; cached: boolean }> {
  const cacheKey = `${tikTokCacheKeys.page}-${url}`;
  const tsCacheKey = `${tikTokCacheKeys.pageTs}-${url}`;
  const cached = await cacheStore.get(cacheKey);
  let body = cached;

  if (!cached) {
    // Set cookie here if running into scraping errors
    // await setCookie('sid_tt=abc123', '.tiktok.com');
    // await setCookie(
    //   'sessionid=abc123',
    //   '.tiktok.com'
    // );
    const Tok = await fetchTikTokURL(url);
    if (Tok.body) {
      body = Tok.body;
    }
  }

  try {
    if (body) {
      const verifyCheckRegexp =
        /(const option = {"title":"tiktok-verify-page")/;
      const verifyCheck = getFirstRegExpMatch(body, verifyCheckRegexp);
      if (verifyCheck) {
        // wait 1 second then try again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const Tok = await fetchTikTokURL(url);
        if (Tok.body) {
          body = Tok.body;
          const secondVerifyCheck = getFirstRegExpMatch(
            body,
            verifyCheckRegexp
          );
          // if still not verified, throw error
          if (secondVerifyCheck) {
            throw new Error(
              'Verification page detected. Please try again later.'
            );
          }
        }
      }
      await cacheStore.set(cacheKey, body);
      await cacheStore.set(tsCacheKey, Date.now().toString());
    }
  } catch (err) {
    await cacheStore.delete(cacheKey);
    await cacheStore.delete(tsCacheKey);
    throw err;
  }

  return { body: body ?? null, cached: !!cached };
}

export async function scrapeTikTokVideoStats(url: string): Promise<{
  data: TikTokVideoMetrics | null;
  cached: boolean;
}> {
  const videoCacheKey = `${tikTokCacheKeys.videoStats}-${url}`;
  const { body, cached } = await scrapeTikTokPage(url);

  if (!body)
    return {
      data: null,
      cached,
    };

  const data = getTikTokVideoStatsFromRegExp(body);
  await cacheStore.set(videoCacheKey, JSON.stringify(data));

  return {
    data,
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
  const tikTokNewestVideoIds = await getUserNewestTikTokVideoIds(
    username,
    count
  );

  if (tikTokNewestVideoIds.length !== count) return emptyStats;

  const allVideoStats = {
    likes: 0,
    comments: 0,
    shares: 0,
  };

  for (const videoId of tikTokNewestVideoIds) {
    const videoURL = `https://www.tiktok.com/${username}/video/${videoId}`;
    const { data: videoStats } = await scrapeTikTokVideoStats(videoURL);

    if (videoStats) {
      allVideoStats.likes += videoStats.likes;
      allVideoStats.comments += videoStats.comments;
      allVideoStats.shares += videoStats.shares;
      continue;
    }

    const { data, cached } = await scrapeTikTokVideoStats(videoURL);
    const { comments, shares, likes } = data ?? emptyStats;
    if (!cached) {
      // console.log('waiting before next fetch...');
      // wait 1 to 2 seconds
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(1000, Math.random() * 2000))
      );
    }
    allVideoStats.likes += likes;
    allVideoStats.comments += comments;
    allVideoStats.shares += shares;
  }

  // Average all of the stats
  return Object.entries(allVideoStats).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: calcAvg(value, count, true),
    }),
    {} as TikTokVideoMetrics
  );
}

export async function getCachedTikTokVideoStats(
  url: string
): Promise<TikTokVideoMetrics> {
  const cacheKey = `${tikTokCacheKeys.videoStats}-${url}`;
  const cached = await cacheStore.get(cacheKey);
  if (!cached) return emptyStats;
  return JSON.parse(cached);
}

export async function getOnlyCachedTikTokVideosStats(
  urls: string[]
): Promise<TikTokVideoMetrics[]> {
  const cacheKeys = urls.map((url) => `${tikTokCacheKeys.videoStats}-${url}`);
  const values = [] as TikTokVideoMetrics[];
  for (const cacheKey of cacheKeys) {
    const cached = await cacheStore.get(cacheKey);
    if (cached) {
      values.push(JSON.parse(cached));
    } else {
      // Do nothing to prevent affecting average calculations
      // in the case of a cache miss we could queue a fetch here
    }
  }
  return values;
}

/**
 * Scrape the TikTok user profile page for the newest video IDs
 *
 * @param username TikTok username
 * @param count Number of videos to scrape
 * @param profileHTMLCache Cached profile HTML body text
 */
export async function getUserNewestTikTokVideoIds(
  username: string,
  count = 10,
  profileHTMLCache?: string | null
): Promise<string[]> {
  const tikTokURL = `https://www.tiktok.com/${username}?lang=en`;
  const profileHTML =
    profileHTMLCache || (await scrapeTikTokPage(tikTokURL)).body;

  if (!profileHTML) return [];

  const tikTokNewestVideoIdsGroup = getFirstRegExpMatch(
    profileHTML,
    /{"user-post":{"list":\[(.*)\]/
  );

  if (!tikTokNewestVideoIdsGroup) return [];

  const tikTokNewestVideoIds = getAllRegExpMatch(
    tikTokNewestVideoIdsGroup,
    /\d{19}/g,
    (m) => m[0],
    count
  );

  // Sometimes we are getting duplicate video IDs
  return Array.from(new Set(tikTokNewestVideoIds));
}

/**
 * Fetch only cached tiktok videos stats
 *
 * @param username TikTok username
 * @param count Number of videos to return
 * @param profileHTMLCache Cached profile HTML body text
 * @returns Array of video stats
 */
export async function getAvailableUserVideosStats(
  username: string,
  count = 10,
  profileHTMLCache = ''
): Promise<TikTokVideoMetrics[]> {
  const videoIds = await getUserNewestTikTokVideoIds(
    username,
    count,
    profileHTMLCache
  );

  const urls = videoIds.map(
    (videoId) => `https://www.tiktok.com/${username}/video/${videoId}`
  );

  const stats = await getOnlyCachedTikTokVideosStats(urls);

  return stats;
}
