import {
  calcArrayAvg,
  calcCreatorInteractionRate,
  formatTikTokNumbers,
} from '@/lib/formatters';
import {
  getAllRegExpMatch,
  getFirstRegExpMatch,
  getNthRegExpMatch,
} from '@/lib/regexp';
import { scrapeNewestTikTokVideoStats, scrapeTikTokPage } from '@/lib/scrapers';

const MAX_VIDEOS_TO_SCRAPE = 10;

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

  const tikTokName = getNthRegExpMatch(
    body,
    /"@id":"https:\/\/www\.tiktok\.com\/@([a-zA-Z][a-zA-Z0-9-_.]{1,24})","name":"(.{1,30}) \(/,
    2
  );

  if (!tikTokName) return null;

  const tikTokFollowers = getFirstRegExpMatch(
    body,
    /followers-count">([0-9.\w]+)</
  );

  const tikTokVideoCounts = getAllRegExpMatch(
    body,
    /<strong data-e2e="video-views" class="video-count [\w\d\s-]+">(.{1,15})<\/strong>/g,
    (m) => m[1],
    MAX_VIDEOS_TO_SCRAPE
  ).map(formatTikTokNumbers);

  const avgTikTokVideoViews = calcArrayAvg(tikTokVideoCounts);

  const metrics = await scrapeNewestTikTokVideoStats(
    username,
    MAX_VIDEOS_TO_SCRAPE
  );

  const {
    comments: average_comments,
    likes: average_likes,
    shares: average_shares,
  } = metrics;

  const data: TikTokUserMetrics = {
    user: {
      display_name: tikTokName,
    },
    metrics: {
      total_followers: formatTikTokNumbers(tikTokFollowers),
      average_video_views: avgTikTokVideoViews,
      average_comments,
      average_likes,
      average_shares,
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
