import { ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Underlined "view all" style link with an arrow. */
export function TextLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        'group border-foreground text-foreground hover:border-brand hover:text-brand inline-flex items-center gap-2 border-b pb-1 text-sm font-medium transition-colors',
        className
      )}
    >
      {children}
      <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' aria-hidden />
    </Link>
  );
}
