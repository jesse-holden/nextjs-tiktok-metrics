import {
  calcArrayAvg,
  calcAvg,
  calcInteractionRate,
  formatTikTokNumbers,
  formatTikTokUsername,
} from '@/lib/formatters';
import {
  getAllRegExpMatch,
  getFirstRegExpMatch,
  getNthRegExpMatch,
} from '@/lib/regexp';
import {
  getAvailableUserVideosStats,
  scrapeNewestTikTokVideoStats,
  scrapeTikTokPage,
  TikTokVideoMetrics,
} from '@/lib/scrapers';

const MAX_VIDEOS_TO_SCRAPE = 10;

export type TikTokUserMetrics = {
  user: {
    display_name: string;
    avatar_url: string;
  };
  metrics: {
    total_followers: number;
    average_video_views: number;
    interaction_rate: number;
    average_comments: number;
    average_likes: number;
    average_shares: number;
  };
  meta: {
    video_stats_loading: boolean;
  };
};

export async function getTikTokUserMetrics(identifier: string) {
  const username = formatTikTokUsername(identifier);
  const tikTokURL = `https://www.tiktok.com/${username}?lang=en`;

  const { body: profileHTML } = await scrapeTikTokPage(tikTokURL);
  if (!profileHTML) return null;

  const tikTokName: string = getNthRegExpMatch(
    profileHTML,
    /"@id":"https:\/\/www\.tiktok\.com\/@([a-zA-Z][a-zA-Z0-9-_.]{1,24})","name":"(.{1,30}) \(/,
    2
  );
  if (!tikTokName) return null;

  const tikTokAvatarURL: string =
    getFirstRegExpMatch(
      profileHTML,
      /<style data-emotion="tiktok .{1,10}-ImgAvatar">.{1,100}<img loading="lazy" src="(.{1,250})" class="tiktok-.{1,10}-ImgAvatar/
    ) || '';

  const tikTokFollowers: string = getFirstRegExpMatch(
    profileHTML,
    /followers-count">([0-9.\w]+)</
  );

  const tikTokVideoViews: number[] = getAllRegExpMatch(
    profileHTML,
    /<strong data-e2e="video-views" class="video-count [\w\d\s-]+">(.{1,15})<\/strong>/g,
    (m) => m[1],
    MAX_VIDEOS_TO_SCRAPE
  ).map(formatTikTokNumbers);

  const avgTikTokVideoViews: number = calcArrayAvg(tikTokVideoViews);

  const metrics: TikTokVideoMetrics[] = await getAvailableUserVideosStats(
    username,
    MAX_VIDEOS_TO_SCRAPE,
    profileHTML
  );

  // Sum all the metrics
  const combinedStats = metrics.reduce(
    (acc, curr) => {
      acc.comments += curr.comments;
      acc.likes += curr.likes;
      acc.shares += curr.shares;
      return acc;
    },
    {
      likes: 0,
      comments: 0,
      shares: 0,
    } as TikTokVideoMetrics
  );

  // Average all of the stats togther
  const averagedStats = Object.entries(combinedStats).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: calcAvg(value, metrics.length, true),
    }),
    {} as TikTokVideoMetrics
  );

  const data = {
    user: {
      display_name: tikTokName,
      avatar_url: tikTokAvatarURL,
    },
    metrics: {
      total_followers: formatTikTokNumbers(tikTokFollowers),
      average_video_views: avgTikTokVideoViews,
      average_comments: averagedStats.comments,
      average_likes: averagedStats.likes,
      average_shares: averagedStats.shares,
      interaction_rate: calcInteractionRate(averagedStats, avgTikTokVideoViews),
    },
    meta: {
      // Loading state if there was missing video data that can be fetched again
      video_stats_loading: !metrics.length,
    },
  } as TikTokUserMetrics;

  return data;
}

/**
 * Get the latest TikTok video stats for a user (slow)
 */
export async function getTikTokUserCompleteVideoMetrics(
  username: string
): Promise<TikTokVideoMetrics> {
  const metrics = await scrapeNewestTikTokVideoStats(
    formatTikTokUsername(username),
    MAX_VIDEOS_TO_SCRAPE
  );

  return metrics;
}
1;
