import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface ICategoryFilterItem {
  href: string;
  label: string;
  isActive: boolean;
}

/** Row of filter chips; scrolls sideways on narrow screens. */
export function CategoryFilter({ label, items }: { label: string; items: ICategoryFilterItem[] }) {
  return (
    <nav aria-label={label} className='-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
      <ul className='flex w-max gap-2'>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className={cn(
                'block border px-4 py-2 text-sm transition-colors',
                item.isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-input hover:border-foreground'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
