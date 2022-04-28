import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';
import { PublicConfiguration } from 'swr/dist/types';

import { fetcher } from '@/lib/fetcher';
import { match } from '@/lib/match-case';
import { getTikTokUserMetrics, TikTokUserMetrics } from '@/lib/tiktok-api';

import Layout from '@/components/layout/Layout';
import Metric from '@/components/metrics/Metric';
import Seo from '@/components/Seo';

type UserMetricKeys = keyof TikTokUserMetrics['metrics'];

const GridDataLabelMap: Record<UserMetricKeys, string> = {
  total_followers: 'Total Followers',
  average_video_views: 'Average Video Views',
  interaction_rate: 'Interaction-rate',
  average_comments: 'Average Comments',
  average_likes: 'Average Likes',
  average_shares: 'Average Shares',
};

const stringToLocaleNumber = (value: number | string): string => {
  const num = Number(value);
  return num.toLocaleString();
};

const floatToPercent = (value: number | string): string => {
  const num = Number(value);
  return `${num * 100}%`;
};

const FormatGridDataValueCases = {
  'Interaction-rate': floatToPercent,
  default: stringToLocaleNumber,
};

type GridData = {
  label: string;
  value: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  const handle = String(query.handle);
  const key = `/api/metrics/tiktok/users/${handle}`;

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

  const data = await getTikTokUserMetrics(handle);
  props.fallback[key] = data;

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=299'
  );

  return {
    props,
    ...(!data
      ? {
          redirect: {
            permanent: false,
            // Navigate back to the home page if user does not exist
            destination: '/',
          },
        }
      : {}),
  };
};

interface Props {
  fallback: PublicConfiguration['fallback'];
}

export default function TikTokMetricsUserPage({ fallback }: Props) {
  const router = useRouter();
  const {
    query: { handle, s },
  } = router;
  const { data, error } = useSWR<TikTokUserMetrics>(
    () => handle && `/api/metrics/tiktok/users/${handle}`,
    fetcher,
    { fallback, refreshInterval: 30_000 }
  );

  // client-side-only code
  if (typeof window !== 'undefined' && s) {
    // Remove the ?s=1 query param
    router.replace(
      {
        pathname: router.pathname,
        query: { handle },
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
    if (!data) return null;
    const { metrics } = data;
    return Object.entries(metrics).map(([key, metricValue]) => {
      const label = match(key, GridDataLabelMap, { emptyCaseValue: key });
      const value = match(key, FormatGridDataValueCases)(metricValue);

      return {
        label,
        value,
      };
    });
  }, [data]);

  return (
    <Layout>
      <Seo templateTitle={`TikTok metrics for @${handle}`} />

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
                    tiktok.com/@{handle}
                  </p>
                  <div className='w-152 rounded-16 border-1 border-gray-400 p-4'>
                    <span className='pl-3 font-semibold text-dark'>
                      {data?.user.display_name}
                    </span>
                  </div>
                </div>
                <div className='mt-16 grid grid-cols-2 gap-0 border-b-1 border-gray-400 py-16 md:grid-cols-3 md:rounded-16 md:border-b-0 md:py-32 md:ring-1 md:ring-gray-400'>
                  <div className='contents'>
                    {formattedData.map((item, index) => (
                      <Metric key={item.label} index={index} label={item.label}>
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
