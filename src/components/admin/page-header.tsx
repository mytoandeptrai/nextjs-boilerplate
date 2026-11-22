import type { ReactNode } from 'react';

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
      <div className='min-w-0'>
        <h1 className='text-2xl font-light tracking-tight lg:text-3xl'>{title}</h1>
        {subtitle ? <p className='text-muted-foreground mt-1 text-sm'>{subtitle}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}
