import * as React from 'react';

import clsxm from '@/lib/clsxm';

type MetricProps = {
  label: string;
  index: number;
} & React.ComponentPropsWithoutRef<'div'>;

export default function Metric({
  className,
  label,
  children,
  index,
  ...rest
}: MetricProps) {
  return (
    <div
      className={clsxm(
        'my-16 border-t-1 border-gray-400 px-8 pt-32',
        index < 3 && 'md:border-t-0 md:pt-0',
        index % 3 === 0 && 'md:ml-16',
        index % 3 === 2 && 'md:mr-16',
        className
      )}
      {...rest}
    >
      <div
        className={clsxm(
          'border-gray-400 pl-16',
          index % 2 === 1 && 'border-l-2 pl-20',
          'md:border-l-2 md:pl-16',
          index % 3 === 0 && 'md:border-l-0 md:pl-0'
        )}
      >
        <p className='whitespace-nowrap text-xs font-semibold text-medium'>
          {label}
        </p>
        <p className='text-3xl font-semibold text-dark'>{children}</p>
      </div>
    </div>
  );
}
