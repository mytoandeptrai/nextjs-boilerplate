import initTranslations from '@/libs/i18n';
import { AuthProvider } from '@/contexts/auth';
import ServicesProvider from '@/services';
import { ProgressBarProvider, QueryClientProvider, ThemeProvider, TranslationsProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export default async function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { resources } = await initTranslations(locale);

  return (
    <QueryClientProvider>
      <ThemeProvider>
        <AuthProvider>
          <ServicesProvider>
            <ProgressBarProvider>
              <TranslationsProvider locale={locale} resources={resources}>
                {children}
                <Toaster />
              </TranslationsProvider>
            </ProgressBarProvider>
          </ServicesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
