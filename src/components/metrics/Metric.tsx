import { Ring } from '@uiball/loaders';
import * as React from 'react';

import clsxm from '@/lib/clsxm';

type MetricProps = {
  label: string;
  index: number;
  loading?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

export default function Metric({
  className,
  label,
  children,
  index,
  loading = false,
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
        <p data-cy='metric-value' className='text-3xl font-semibold text-dark'>
          {loading ? (
            <Ring size={30} lineWeight={5} speed={2.5} color='#0F1D40' />
          ) : (
            children
          )}
        </p>
      </div>
    </div>
  );
}
