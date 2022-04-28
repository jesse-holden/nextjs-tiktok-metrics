import * as React from 'react';

import clsxm from '@/lib/clsxm';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ShowPerformanceButtonPage({
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      type='submit'
      className={clsxm(
        'mt-28 w-full items-center rounded-16 bg-primary-700 py-12 font-semibold text-white disabled:bg-gray-300 disabled:text-disabled',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
