import Keyv from '@keyvhq/core';
import KeyvSQLite from '@keyvhq/sqlite';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { gotScraping, ToughCookieJar } from 'got-scraping';
import { CookieJar } from 'tough-cookie';
import { promisify } from 'util';

const keyvSQLite = new Keyv({
  store: new KeyvSQLite('./database.sqlite'),
});

// Caching strategy for TikTok requests
const cacheStore = keyvSQLite;

const cookieJar = new CookieJar();
const _setCookie = promisify(cookieJar.setCookie.bind(cookieJar));

const BASE_URL = 'https://www.tiktok.com';

export function getUserInfoContentURL(identifier: string): string {
  if (!identifier || typeof identifier === 'undefined') {
    throw new Error('Passed User must have a username set.');
  }

  return `${BASE_URL}/node/share/user/@${identifier}`;
}

export default class TikTokAPI {
  readonly request: AxiosInstance;
  readonly baseURL: string;

  constructor(baseURL: string = BASE_URL, config = {} as AxiosRequestConfig) {
    this.baseURL = baseURL;
    this.request = axios.create({
      baseURL: this.baseURL,
      headers: {
        // host: this.config.host,
        connection: 'keep-alive',
        'accept-encoding': 'gzip',
        // 'user-agent': this.config.userAgent,
        'sdk-version': 1,
        'x-ss-tc': 0,
      },
      withCredentials: true,
      ...config,
    } as AxiosRequestConfig);
  }

  async getUserInfoContent(identifier: string): Promise<string> {
    const url = getUserInfoContentURL(identifier);
    const response = await this.request.get(url);
    return response.data;
  }
}

export type TikTokUserMetrics = {
  user: {
    display_name: string;
  };
  metrics: {
    total_followers: number;
    average_video_views: number;
    interaction_rate: number;
    average_comments: number;
    average_likes: number;
    average_shares: number;
  };
};

export async function getMockTikTokUserMetrics(
  identifier: string
): Promise<TikTokUserMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    user: {
      display_name: identifier,
    },
    metrics: {
      total_followers: Math.floor(Math.random() * 100_000),
      average_video_views: Math.floor(Math.random() * 100_000),
      interaction_rate: Math.floor(Math.random() * 100),
      average_comments: Math.floor(Math.random() * 10_000),
      average_likes: Math.floor(Math.random() * 10_000),
      average_shares: Math.floor(Math.random() * 10_000),
    },
  } as TikTokUserMetrics;
}

/**
 * Takes a string scraped from TikTok and converts it to a number
 * @param value Input value (ie. 5.3M, 3.2K, 6000, etc.)
 */
function formatTikTokNumbers(value: string): number {
  if (!value) {
    return 0;
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

function fetchTikTokURL(url: string) {
  return gotScraping({
    url,
    cookieJar: cookieJar as ToughCookieJar,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      referer: 'https://www.tiktok.com/',
    },
  });
}

async function scrapeTikTokPage(
  url: string
): Promise<{ body: string | null; cached: boolean }> {
  const cached = await cacheStore.get(url);
  let body = cached;

  if (!cached) {
    // Set cookie here if running into scraping errors
    // await _setCookie('sid_tt=abc123', '.tiktok.com');
    // await _setCookie(
    //   'sessionid=abc123',
    //   '.tiktok.com'
    // );
    const Tok = await fetchTikTokURL(url);
    body = Tok?.body;
    await cacheStore.set(url, body);
  }

  try {
    if (body) {
      if (
        (body.match(/const option = {"title":"tiktok-verify-page"/) || [])
          .length
      ) {
        throw new Error('Verification page detected. Please try again later.');
      }
    }
  } catch (err) {
    await cacheStore.delete(url);
    throw err;
  }

  return { body: body ?? null, cached: !!cached };
}

const tikTokVideoCountMap = {
  commentCount:
    /data-e2e="comment-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
  sharesCount: /data-e2e="share-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
  likesCount: /data-e2e="like-count" class="tiktok[\w\d\s-]+">([0-9.\w]+)<\//,
};

function getCount(selector: RegExp, searchBody: string): number {
  const [, count] = searchBody.match(selector) || [];
  return formatTikTokNumbers(count ?? 0);
}

async function getTikTokVideoInfo(url: string): Promise<{
  data: { commentCount: number; likesCount: number; sharesCount: number };
  cached: boolean;
}> {
  const { body, cached } = await scrapeTikTokPage(url);
  if (!body)
    return { data: { commentCount: 0, likesCount: 0, sharesCount: 0 }, cached };

  return {
    data: Object.entries(tikTokVideoCountMap).reduce(
      (acc, [key, regexp]) => ({
        ...acc,
        [key]: getCount(regexp, body),
      }),
      {} as { [key in keyof typeof tikTokVideoCountMap]: number }
    ),
    cached,
  };
}

export async function getTikTokUserMetrics(identifier: string) {
  if (identifier === 'fail') {
    return null;
  }

  // append @ if not present
  const username: string = identifier.startsWith('@')
    ? identifier
    : `@${identifier}`;

  const tikTokURL = `https://www.tiktok.com/${username}?lang=en`;

  const { body } = await scrapeTikTokPage(tikTokURL);

  if (!body) return null;

  const [, , tikTokName] =
    body.match(
      /"@id":"https:\/\/www\.tiktok\.com\/@([a-zA-Z][a-zA-Z0-9-_.]{1,24})","name":"(.{1,30}) \(/
    ) || [];

  if (!tikTokName) return null;

  const [, tikTokFollowers] = body.match(/followers-count">([0-9.\w]+)</) || [];

  const videoViewsRegxp =
    /<strong data-e2e="video-views" class="video-count [\w\d\s-]+">(.{1,15})<\/strong>/g;
  const [...tikTokVideoCounts] = Array.from(
    body.matchAll(videoViewsRegxp),
    (m) => m[1]
  )
    .slice(0, 10)
    .map((count) => {
      return formatTikTokNumbers(count);
    });
  const avgTikTokVideoViews =
    tikTokVideoCounts.reduce((a, b) => a + b, 0) / tikTokVideoCounts.length;

  const [, tikTokNewestVideoIdsGroup] =
    body.match(
      /Newest TikTok Videos"}},"ItemList":{"user-post":{"list":\[(.*)\]/
    ) || [];
  const tikTokNewestVideoIdsRegxp = /\d{19}/g;
  const [...tikTokNewestVideoIds] = Array.from(
    (tikTokNewestVideoIdsGroup || '').matchAll(tikTokNewestVideoIdsRegxp),
    (m) => m[0]
  ).slice(0, 10);

  let totalCommentCount = 0;
  let totalSharesCount = 0;
  let totalLikesCount = 0;

  //TODO: refactor and make async
  for (const videoId of tikTokNewestVideoIds) {
    const videoURL = `https://www.tiktok.com/${username}/video/${videoId}`;
    const {
      data: { commentCount, likesCount, sharesCount },
      cached,
    } = await getTikTokVideoInfo(videoURL);
    if (!cached) {
      // eslint-disable-next-line no-console
      console.log('fetched', videoURL);
      // eslint-disable-next-line no-console
      console.log('waiting 1.5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    totalCommentCount += commentCount;
    totalSharesCount += sharesCount;
    totalLikesCount += likesCount;
  }

  const data: TikTokUserMetrics = {
    user: {
      display_name: tikTokName,
    },
    metrics: {
      total_followers: formatTikTokNumbers(tikTokFollowers),
      average_video_views: avgTikTokVideoViews,
      average_comments: totalCommentCount / tikTokVideoCounts.length,
      average_likes: totalLikesCount / tikTokVideoCounts.length,
      average_shares: totalSharesCount / tikTokVideoCounts.length,
      interaction_rate: 0,
    },
  };

  data.metrics.interaction_rate = calcCreatorInteractionRate(
    data.metrics.average_comments,
    data.metrics.average_likes,
    data.metrics.average_shares,
    data.metrics.average_video_views
  );

  return data;
}

function calcCreatorInteractionRate(
  commentCount: number,
  likesCount: number,
  sharesCount: number,
  viewsCount: number
): number {
  return Number(
    ((commentCount + likesCount + sharesCount) / viewsCount).toFixed(2)
  );
}
