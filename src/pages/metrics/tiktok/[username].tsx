/* eslint-disable @next/next/no-img-element */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';
import { PublicConfiguration } from 'swr/dist/types';

import { fetcher } from '@/lib/fetcher';
import {
  calcInteractionRate,
  floatToPercentString,
  stringToLocaleString,
} from '@/lib/formatters';
import { match } from '@/lib/match-case';
import { TikTokVideoMetrics } from '@/lib/scrapers';
import { getTikTokUserMetrics, TikTokUserMetrics } from '@/lib/tiktok-api';

import Layout from '@/components/layout/Layout';
import Metric from '@/components/metrics/Metric';
import NextImage from '@/components/NextImage';
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

// Allows us to get around the NextJS wildcard limitation
const tiktokCDNFix = (url: string) =>
  `/api/imageProxy?imageUrl=${encodeURIComponent(url)}`;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
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
    query: { username, s: skipPrefetch },
  } = router;
  const { data, error } = useSWR<TikTokUserMetrics>(
    () => username && `/api/metrics/tiktok/users/${username}`,
    fetcher,
    { fallback, refreshInterval: 30_000 }
  );
  const isAdditionStatsRequired = !!data?.meta.video_stats_loading;
  const { data: videoData } = useSWR<TikTokVideoMetrics>(
    () =>
      username &&
      isAdditionStatsRequired &&
      `/api/metrics/tiktok/users-video-data/${username}`,
    fetcher
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
  if (typeof window !== 'undefined') {
    if (skipPrefetch) {
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
  }

  const formattedData: GridData[] | null = React.useMemo(() => {
    if (!combinedData) return null;
    const { metrics } = combinedData;
    return Object.entries(metrics).map(([key, metricValue]) => {
      const label = match(key, GridDataLabelMap, { emptyCaseValue: key });
      const value = match(key, {
        interaction_rate: floatToPercentString,
        default: stringToLocaleString,
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
                  <div className='inline-block rounded-16 border-1 border-gray-400 p-4'>
                    <span
                      data-cy='tiktok-displayname'
                      className='flex p-0 align-middle font-semibold text-dark'
                    >
                      <NextImage
                        src={tiktokCDNFix(data?.user.avatar_url || '')}
                        alt=''
                        className='mx-8 inline-block h-24 w-24'
                        imgClassName='rounded-full'
                        width={24}
                        height={24}
                        useSkeleton
                      />
                      <span className='mr-12'>{data?.user.display_name}</span>
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
