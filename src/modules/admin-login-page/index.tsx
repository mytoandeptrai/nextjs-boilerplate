'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createLoginSchema, type LoginFormData, useLoginMutation } from '@/api/admin-auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LogoMark } from '@/components/brand/logo';
import { siteConfig } from '@/config/site';
import { ROUTES, safeAdminNext } from '@/constants/routes';
import { HttpStatus } from '@/enums/enum';
import { useTranslations } from '@/hooks';
import { Link, useRouter } from '@/i18n/navigation';

export default function AdminLoginPage() {
  const { t } = useTranslations('auth');
  const { t: tValidation } = useTranslations('validation');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate, isPending, error } = useLoginMutation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const schema = useMemo(
    () =>
      createLoginSchema({
        invalidEmail: tValidation('invalidEmail'),
        passwordRequired: tValidation('passwordRequired'),
      }),
    [tValidation]
  );
  const form = useForm<LoginFormData>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const _handleSubmit = (values: LoginFormData) =>
    mutate(values, {
      onSuccess: () => {
        // Only same-app admin paths are accepted as the destination.
        router.replace(safeAdminNext(searchParams.get('next')));
        router.refresh();
      },
    });

  const errorKey: Record<number, 'invalidCredentials' | 'tooManyAttempts'> = {
    [HttpStatus.UNAUTHORIZED]: 'invalidCredentials',
    [HttpStatus.TOO_MANY_REQUESTS]: 'tooManyAttempts',
  };
  const errorMessage = error ? t(errorKey[error.status] ?? 'unavailable') : null;

  return (
    <main className='flex min-h-dvh items-center justify-center px-4 py-12'>
      <div className='w-full max-w-sm'>
        <LogoMark className='mx-auto mb-4 size-12' />
        <p className='text-center text-sm font-medium tracking-[0.28em] uppercase'>{siteConfig.shortName}</p>
        <div className='border-border bg-card mt-8 border p-6 sm:p-8'>
          <h1 className='text-2xl font-light tracking-tight'>{t('title')}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{t('hint')}</p>

          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(_handleSubmit)} className='mt-6 flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type='email' autoComplete='username' placeholder={t('emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          type={isPasswordVisible ? 'text' : 'password'}
                          autoComplete='current-password'
                          placeholder={t('passwordPlaceholder')}
                          className='pr-10'
                          {...field}
                        />
                      </FormControl>
                      <button
                        type='button'
                        onClick={() => setIsPasswordVisible((value) => !value)}
                        aria-label={isPasswordVisible ? t('hidePassword') : t('showPassword')}
                        className='text-muted-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center'
                      >
                        {isPasswordVisible ? (
                          <EyeOff className='size-4' aria-hidden />
                        ) : (
                          <Eye className='size-4' aria-hidden />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMessage ? (
                <p role='alert' className='text-destructive text-sm'>
                  {errorMessage}
                </p>
              ) : null}
              <Button type='submit' size='lg' className='mt-2 h-11 rounded-none' disabled={isPending}>
                {isPending ? <Loader2 className='animate-spin' aria-hidden /> : null}
                {isPending ? t('signingIn') : t('signIn')}
              </Button>
            </form>
          </Form>
        </div>
        <Link href={ROUTES.HOME} className='text-muted-foreground hover:text-foreground mt-6 block text-center text-sm'>
          {t('backToStore')}
        </Link>
      </div>
    </main>
  );
}
