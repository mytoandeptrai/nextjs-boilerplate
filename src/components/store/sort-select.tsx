'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';

interface ISortSelectProps {
  label: string;
  value: string;
  /** `href` is the address of the list in that order. */
  options: { value: string; label: string; href: string }[];
}

/** Order of a server-rendered list: choosing an option navigates to its address. */
export function SortSelect({ label, value, options }: ISortSelectProps) {
  const router = useRouter();

  const _handleChange = (next: string) => {
    const option = options.find((item) => item.value === next);

    if (option && next !== value) router.push(option.href);
  };

  return (
    <div className='flex shrink-0 items-center gap-3'>
      <span className='text-muted-foreground text-sm' aria-hidden>
        {label}
      </span>
      <Select value={value} onValueChange={_handleChange}>
        <SelectTrigger aria-label={label} className='bg-background w-48 rounded-none'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
