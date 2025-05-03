import * as React from 'react';

import { Icons } from '@/assets/icons';
import { cn } from '@/libs/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  containerClassName?: InputProps['className'];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suffix, prefix, containerClassName, ...props }, ref) => {
    const [isShowPassword, setIsShowPassword] = React.useState<Boolean>(false);

    return (
      <div className={cn('relative', containerClassName)}>
        {prefix && (
          <label className={cn('-translate-y-1/2 -translate-x-1/2 pointer-events-none absolute top-1/2 left-5')}>
            {prefix}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          data-slot='input'
          className={cn(
            'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
            className
          )}
          {...props}
        />
        {suffix && type !== 'password' && (
          <label className='-translate-y-1/2 absolute top-1/2 right-5 z-10'>{suffix}</label>
        )}

        {type === 'password' && (
          <button
            type='button'
            onClick={() => setIsShowPassword(!isShowPassword)}
            className={cn('-translate-y-1/2 absolute top-1/2 right-[10px] z-10')}
          >
            {isShowPassword ? <Icons.eye className='stroke-gray-200' /> : <Icons.eyeOff className='stroke-gray-200' />}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
