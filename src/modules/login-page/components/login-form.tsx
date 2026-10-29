'use client';

import type React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { createLoginSchema, type LoginFormData, useLoginMutation } from '@/api/auth';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link, useRouter } from '@/i18n/navigation';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { mutateAsync: login, isPending } = useLoginMutation();
  const { t } = useTranslations('auth');
  const { t: tValidation } = useTranslations('validation');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginFormSchema = useMemo(
    () =>
      createLoginSchema({
        invalidEmail: tValidation('invalidEmail'),
        passwordRequired: tValidation('passwordRequired'),
      }),
    [tValidation]
  );

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
      router.replace(ROUTES.HOME);
    } catch {
      setError(t('invalidCredentials'));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col gap-6', className)} {...props}>
      <div className='mb-2 flex justify-center'>
        <Image src={'/favicon-96x96-1.png'} alt={t('logoAlt')} width={180} height={60} priority />
      </div>
      <Card className='border-0 shadow-lg'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold'>{t('welcomeBack')}</CardTitle>
          <CardDescription className='text-muted-foreground'>{t('credentialsHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className='flex flex-col gap-5'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder={t('emailPlaceholder')} className='h-11' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <div className='flex items-center justify-between'>
                      <FormLabel>{t('password')}</FormLabel>
                      <Link href='/forgot-password' className='text-primary text-sm hover:underline'>
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('passwordPlaceholder')}
                          className='h-11 pr-10'
                          {...field}
                        />
                        <button
                          type='button'
                          className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                          <span className='sr-only'>{showPassword ? t('hidePassword') : t('showPassword')}</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className='rounded-md bg-red-50 p-3 text-center text-sm text-red-500'>{error}</div>}
              <Button
                type='submit'
                className='mt-2 h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader className='mr-2 h-4 w-4 animate-spin' />
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex justify-center border-t p-6'>
          <p className='text-muted-foreground text-sm'>
            {t('noAccount')}{' '}
            <Link href='/register' className='text-primary font-medium hover:underline'>
              {t('createAccount')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
