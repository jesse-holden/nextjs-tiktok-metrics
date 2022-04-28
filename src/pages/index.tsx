import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { mutate } from 'swr';

import { fetcher } from '@/lib/fetcher';
import { TikTokUserMetrics } from '@/lib/tiktok-api';

import ShowPerformanceButtonPage from '@/components/buttons/ShowPerformanceButton';
import TikTokUsernameInput from '@/components/inputs/TikTokUsernameInput';
import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

export default function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
    setTouched(true);
    setError(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!inputValue) return;
    try {
      setTouched(false);
      setIsFetching(true);
      const key = `/api/metrics/tiktok/users/${inputValue}`;
      const data = await fetcher<TikTokUserMetrics>(key);
      mutate(key, data);

      // We are using ?s=1 query param to skip the server-side data fetch
      router.push(`/metrics/tiktok/${inputValue}?s=1`);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Layout>
      <Seo templateTitle='Home' />

      <main>
        <section className='bg-white'>
          <div className='layout mx-20 flex min-h-screen flex-col items-center p-5 text-center'>
            <h1 className='mt-48 py-32 text-4xl font-semibold text-dark md:text-5xl'>
              TikTok Metrics
            </h1>
            <p className='p-2 text-xl font-medium leading-8 text-medium'>
              Find out how the Creator&apos;s last 10 videos performed.
            </p>
            <form
              className='mt-24 w-full items-center font-semibold md:w-640'
              onSubmit={handleSubmit}
            >
              <span
                className='relative left-22 select-none text-dark'
                onClick={() => inputRef.current?.focus()}
              >
                tiktok.com/@
              </span>
              <span className='ml-22'>
                <TikTokUsernameInput
                  ref={inputRef}
                  spellCheck={false}
                  type='text'
                  required
                  placeholder='username'
                  onChange={onChange}
                  error={error}
                />
              </span>
              <ShowPerformanceButtonPage
                disabled={!inputValue.length || isFetching || !touched}
              >
                {isFetching ? 'Fetching Data...' : 'Show Performance'}
              </ShowPerformanceButtonPage>
            </form>
          </div>
        </section>
      </main>
    </Layout>
  );
}
