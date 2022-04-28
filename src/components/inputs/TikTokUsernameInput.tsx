import * as React from 'react';

import clsxm from '@/lib/clsxm';

type TikTokUsernameInputProps = {
  error?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>;

const TikTokUsernameInput = React.forwardRef<
  HTMLInputElement,
  TikTokUsernameInputProps
>(({ className, error, ...rest }, ref) => {
  return (
    <span>
      <input
        ref={ref}
        className={clsxm(
          '-ml-128 w-full rounded-16 border-2 border-gray-400 py-16 pl-128 font-semibold text-dark shadow-lg shadow-gray-400',
          error &&
            'shadow-box border-2 border-danger-500 text-danger-700 shadow-2 ring-4  ring-danger-300 focus:border-2 focus:outline-4 focus:outline-danger-500 focus:ring-4 focus:ring-danger-300',
          className
        )}
        {...rest}
      />
      {error && (
        <p className='mt-8 text-left text-sm font-semibold text-danger-700'>
          {error}
        </p>
      )}
    </span>
  );
});

export default TikTokUsernameInput;
