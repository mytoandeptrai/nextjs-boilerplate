import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { getPageItems } from '@/lib/pagination';
import { cn } from '@/lib/utils';

interface IPaginationProps {
  page: number;
  totalPages: number;
  /** Address of a page, keeping the other filters. */
  getHref: (page: number) => string;
  labels: { navigation: string; previous: string; next: string; page: (page: number) => string };
}

const ITEM = 'flex size-10 items-center justify-center border text-sm transition-colors';

/** Page links for a server-rendered list. Renders nothing when everything fits on one page. */
export function Pagination({ page, totalPages, getHref, labels }: IPaginationProps) {
  if (totalPages <= 1) return null;

  const arrow = (target: number, label: string, icon: React.ReactNode) =>
    target >= 1 && target <= totalPages ? (
      <Link href={getHref(target)} aria-label={label} className={cn(ITEM, 'border-input hover:border-foreground')}>
        {icon}
      </Link>
    ) : (
      <span aria-hidden className={cn(ITEM, 'border-input text-muted-foreground/40')}>
        {icon}
      </span>
    );

  return (
    <nav aria-label={labels.navigation} className='mt-12 flex justify-center'>
      <ul className='flex flex-wrap items-center justify-center gap-2'>
        <li>{arrow(page - 1, labels.previous, <ChevronLeft aria-hidden className='size-4' />)}</li>
        {getPageItems(page, totalPages).map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden className='text-muted-foreground px-1'>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={getHref(item)}
                aria-label={labels.page(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  ITEM,
                  item === page
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-input hover:border-foreground'
                )}
              >
                {item}
              </Link>
            </li>
          )
        )}
        <li>{arrow(page + 1, labels.next, <ChevronRight aria-hidden className='size-4' />)}</li>
      </ul>
    </nav>
  );
}
