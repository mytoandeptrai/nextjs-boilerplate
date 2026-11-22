import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ISectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Link or button shown on the right (below on mobile). */
  action?: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, action, as: Tag = 'h2', className }: ISectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className='max-w-2xl'>
        {eyebrow ? <p className='eyebrow mb-3'>{eyebrow}</p> : null}
        <Tag className='text-foreground text-3xl font-light tracking-tight sm:text-4xl'>{title}</Tag>
        {subtitle ? <p className='text-muted-foreground mt-3 leading-7'>{subtitle}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}
