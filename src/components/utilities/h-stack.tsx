import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

const hStackVariants = cva('flex flex-wrap items-center', {
  variants: {
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      default: 'items-stretch',
      center: 'items-center',
      start: 'items-start',
      end: 'items-end',
      baseline: 'items-baseline',
    },
    spacing: {
      0: 'gap-0',
      4: 'gap-1',
      6: 'gap-1.5',
      8: 'gap-2',
      10: 'gap-2.5',
      12: 'gap-3',
      16: 'gap-4',
      20: 'gap-5',
      24: 'gap-6',
      28: 'gap-7',
      32: 'gap-8',
      44: 'gap-11',
      48: 'gap-12',
    },
  },
  defaultVariants: {
    spacing: 4,
    justify: 'start',
  },
});

export interface HStackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof hStackVariants> {
  asChild?: boolean;
  noWrap?: boolean;
}

function HStack({
  className,
  asChild = false,
  noWrap,
  justify,
  align,
  spacing,
  children,
  ref,
  ...props
}: HStackProps & { ref?: React.Ref<HTMLDivElement> }) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      className={cn(hStackVariants({ spacing, align, className, justify }), { 'flex-nowrap': noWrap })}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { HStack, hStackVariants };
