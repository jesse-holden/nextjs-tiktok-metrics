import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';

import Layout from '@/components/layout/Layout';
import Metric from '@/components/metrics/Metric';
import Seo from '@/components/Seo';

const gridData = [
  { title: 'Total Followers', value: '31,200' },
  { title: 'Average Video Views', value: '20,083' },
  { title: 'Interaction-rate', value: '24 %' },
  { title: 'Average Comments', value: '5,211' },
  { title: 'Average Likes', value: '10,123' },
  { title: 'Average Shares', value: '5,000' },
];

export default function TikTokMetricsUserPage() {
  const router = useRouter();
  const {
    query: { handle },
  } = router;
  const { data, error } = useSWR(
    () => handle && `/api/metrics/tiktok/users/${handle}`,
    fetcher
  );

  if (error) {
    router.push('/');
  }

  return (
    <Layout>
      <Seo templateTitle={`TikTok metrics for @${handle}`} />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center p-5 !text-left'>
            {!data && <div className='text-gray-600'>Fetching Data...</div>}
            {data && (
              <div className='layout flex w-full flex-col md:w-7/12 '>
                <div className='pb-32'>
                  <p className='mt-48 w-full !text-left text-base font-semibold text-medium'>
                    Showing data for
                  </p>
                  <p className='mb-8 w-full text-2xl font-semibold text-dark'>
                    tiktok.com/@{handle}
                  </p>
                  <div className='w-152 rounded-16 border-2 border-gray-400 p-4'>
                    <span className='pl-3 font-semibold text-dark'>
                      Display Name
                    </span>
                  </div>
                </div>
                <div className='mt-16 grid grid-cols-2 gap-0 border-b-2 border-gray-400 py-16 md:grid-cols-3 md:rounded-16 md:border-b-0 md:ring-2 md:ring-gray-400'>
                  <div className='contents'>
                    {gridData.map((item, index) => (
                      <Metric key={item.title} index={index} title={item.title}>
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
