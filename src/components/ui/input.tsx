import * as React from 'react';

import { Icons } from '@/assets/icons';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  containerClassName?: InputProps['className'];
}

function Input({
  className,
  type,
  suffix,
  prefix,
  containerClassName,
  ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);

  return (
    <div className={cn('relative', containerClassName)}>
      {prefix && (
        <label className={cn('pointer-events-none absolute top-1/2 left-5 -translate-x-1/2 -translate-y-1/2')}>
          {prefix}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        data-slot='input'
        className={cn(
          'border-input selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          className
        )}
        {...props}
      />
      {suffix && type !== 'password' && (
        <label className='absolute top-1/2 right-5 z-10 -translate-y-1/2'>{suffix}</label>
      )}

      {type === 'password' && (
        <button
          type='button'
          onClick={() => setIsShowPassword(!isShowPassword)}
          className={cn('absolute top-1/2 right-[10px] z-10 -translate-y-1/2')}
        >
          {isShowPassword ? <Icons.eye className='stroke-gray-200' /> : <Icons.eyeOff className='stroke-gray-200' />}
        </button>
      )}
    </div>
  );
}

export { Input };
