'use client';

import { ProgressProvider } from '@bprogress/next/app';
import type { ReactNode } from 'react';

import { QueryClientProvider } from '@/components/providers/query-client-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider height='4px' color='#a12d23' options={{ showSpinner: false }} shallowRouting>
      <QueryClientProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ProgressProvider>
  );
}
