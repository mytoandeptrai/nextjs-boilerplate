'use client';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000,
      retry: false,
    },
  },
});

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ReactQueryClientProvider client={queryClient}>
      {isMounted ? children : <></>}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} />
      )}
    </ReactQueryClientProvider>
  );
}
