import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';
import { PublicConfiguration } from 'swr/dist/types';

import { fetcher } from '@/lib/fetcher';
import {
  calcInteractionRate,
  floatToPercent,
  stringToLocaleNumber,
} from '@/lib/formatters';
import { match } from '@/lib/match-case';
import { TikTokVideoMetrics } from '@/lib/scrapers';
import { getTikTokUserMetrics, TikTokUserMetrics } from '@/lib/tiktok-api';

import Layout from '@/components/layout/Layout';
import Metric from '@/components/metrics/Metric';
import Seo from '@/components/Seo';

type UserMetricKeys = keyof TikTokUserMetrics['metrics'];

type GridData = {
  label: string;
  value: string;
};

const GridDataLabelMap: Record<UserMetricKeys, string> = {
  total_followers: 'Total Followers',
  average_video_views: 'Average Video Views',
  interaction_rate: 'Interaction-rate',
  average_comments: 'Average Comments',
  average_likes: 'Average Likes',
  average_shares: 'Average Shares',
} as const;

// Stats that may return placeholder data
const statsWithLoading = [
  'Average Comments',
  'Average Likes',
  'Average Shares',
  'Interaction-rate',
];

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  const username = String(query.username);
  const key = `/api/metrics/tiktok/users/${username}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {
    fallback: {
      [key]: null,
    },
  };

  // Skip the server-side data fetch if the user is on the page with the ?s=1 query param
  if (query.s) {
    return {
      props,
    };
  }

  try {
    const data = await getTikTokUserMetrics(username);
    props.fallback[key] = data;

    // Navigate back to the home page if user does not exist
    if (!data) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=30, stale-while-revalidate=299'
    );

    return {
      props,
    };
  } catch (err) {
    return {
      props,
      redirect: {
        permanent: false,
        // Navigate back to the home page if user does not exist
        destination: '/',
      },
    };
  }
};

interface Props {
  fallback: PublicConfiguration['fallback'];
}

export default function TikTokMetricsUserPage({ fallback }: Props) {
  const router = useRouter();
  const {
    query: { username, s },
  } = router;
  const { data, error } = useSWR<TikTokUserMetrics>(
    () => username && `/api/metrics/tiktok/users/${username}`,
    fetcher,
    { fallback, refreshInterval: 30_000 }
  );
  const { data: videoData } = useSWR<TikTokVideoMetrics>(
    () => username && `/api/metrics/tiktok/users-video-data/${username}`,
    fetcher,
    {
      isPaused: () => !data || !data.meta.video_stats_loading,
    }
  );

  const combinedData: TikTokUserMetrics | null = React.useMemo(() => {
    if (!data) return null;
    if (!videoData) return data;
    return {
      ...data,
      metrics: {
        ...data.metrics,
        ...{
          average_comments: videoData.comments,
          average_likes: videoData.likes,
          average_shares: videoData.shares,
          interaction_rate: calcInteractionRate(
            videoData,
            data.metrics.average_video_views
          ),
        },
      },
    };
  }, [data, videoData]);

  // client-side-only code
  if (typeof window !== 'undefined' && s) {
    // Remove the ?s=1 query param
    router.replace(
      {
        pathname: router.pathname,
        query: { username },
      },
      undefined,
      { shallow: true }
    );
  }

  if (error) {
    // Navigate back to the home page if user does not exist
    router.replace('/', undefined, { shallow: true });
  }

  const formattedData: GridData[] | null = React.useMemo(() => {
    if (!combinedData) return null;
    const { metrics } = combinedData;
    return Object.entries(metrics).map(([key, metricValue]) => {
      const label = match(key, GridDataLabelMap, { emptyCaseValue: key });
      const value = match(key, {
        interaction_rate: floatToPercent,
        default: stringToLocaleNumber,
      })(metricValue);

      return {
        label,
        value,
      };
    });
  }, [combinedData]);

  return (
    <Layout>
      <Seo templateTitle={`TikTok metrics for @${username}`} />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center p-5 text-left'>
            {!formattedData && (
              <div className='text-gray-600'>Fetching Data...</div>
            )}
            {formattedData && (
              <div className='layout flex w-full flex-col md:w-7/12 '>
                <div className='pb-32'>
                  <p className='mt-48 w-full !text-left text-base font-semibold text-medium'>
                    Showing data for
                  </p>
                  <p className='mb-8 w-full text-2xl font-semibold text-dark'>
                    tiktok.com/@{username}
                  </p>
                  <div className='w-152 rounded-16 border-1 border-gray-400 p-4'>
                    <span
                      data-cy='tiktok-displayname'
                      className='pl-3 font-semibold text-dark'
                    >
                      {data?.user.display_name}
                    </span>
                  </div>
                </div>
                <div className='mt-16 grid grid-cols-2 gap-0 border-b-1 border-gray-400 py-16 md:grid-cols-3 md:rounded-16 md:border-b-0 md:py-32 md:ring-1 md:ring-gray-400'>
                  <div className='contents'>
                    {formattedData.map((item, index) => (
                      <Metric
                        key={item.label}
                        data-cy={item.label}
                        index={index}
                        label={item.label}
                        loading={
                          statsWithLoading.includes(item.label) &&
                          data?.meta.video_stats_loading &&
                          !videoData
                        }
                      >
                        {item.value}
                      </Metric>
                    ))}
                  </div>
                </div>
                <div />
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
