'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/libs/utils';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = 'Select items...', className }, ref) => {
    const [open, setOpen] = React.useState(false);

    const handleValueChange = (newValue: string) => {
      const newValues = value.includes(newValue) ? value.filter((v) => v !== newValue) : [...value, newValue];
      onChange(newValues);
    };

    return (
      <SelectPrimitive.Root open={open} onOpenChange={setOpen}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {value.length > 0 ? `${value.length} items selected` : placeholder}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className='h-4 w-4 opacity-50' />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position='popper'
            className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in'
          >
            <SelectPrimitive.Viewport className='p-1'>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleValueChange(option.value)}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    value.includes(option.value) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                    {value.includes(option.value) && <Check className='h-4 w-4' />}
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
