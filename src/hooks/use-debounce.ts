'use client';

import { useEffect, useState } from 'react';

import { SEARCH_DEBOUNCE_MS } from '@/constants/const';

export function useDebounce<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
