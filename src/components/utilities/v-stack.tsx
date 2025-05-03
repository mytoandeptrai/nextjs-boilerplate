import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/libs/utils';

const vStackVariants = cva('flex flex-col', {
  variants: {
    align: {
      default: 'items-stretch',
      center: 'items-center items',
      start: 'items-start',
      end: 'items-end',
      baseline: 'items-baseline',
    },
    justify: {
      default: 'justify-start',
      center: 'justify-center',
      start: 'justify-start',
      between: 'justify-between',
      end: 'justify-end',
      evenly: 'justify-evenly',
      around: 'justify-around',
    },
    spacing: {
      0: 'gap-0',
      2: 'gap-0.5',
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
      36: 'gap-9',
      40: 'gap-10',
      44: 'gap-11',
      56: 'gap-14',
      80: 'gap-20',
    },
  },
  defaultVariants: {
    spacing: 16,
    align: 'default',
    justify: 'default',
  },
});

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof vStackVariants> {
  asChild?: boolean;
}

const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ className, asChild = false, spacing, align, justify, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp className={cn(vStackVariants({ className, spacing, align, justify }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  }
);
VStack.displayName = 'VStack';

export { VStack, vStackVariants };
