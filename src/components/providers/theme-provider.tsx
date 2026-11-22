'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';

/** The brand palette is light only; the provider stays because shadcn components read the theme. */
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider attribute='class' forcedTheme='light' enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
};
