'use client';

import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useEffect, useState } from 'react';

import { isDevelopmentEnv } from '@/constants/env';
import { useSessionStore } from '@/stores';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 1000,
        retry: false,
      },
    },
  });

export function QueryClientProvider({ children }: { children: ReactNode }) {
  // One client per browser session; `useState` keeps it stable and never shared between SSR requests.
  const [queryClient] = useState(makeQueryClient);

  // Drop every cached response when the identity changes (login / logout).
  useEffect(
    () =>
      useSessionStore.subscribe((session, previous) => {
        if (session.sessionRevision !== previous.sessionRevision) queryClient.clear();
      }),
    [queryClient]
  );

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      {isDevelopmentEnv ? <ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} /> : null}
    </ReactQueryClientProvider>
  );
}
