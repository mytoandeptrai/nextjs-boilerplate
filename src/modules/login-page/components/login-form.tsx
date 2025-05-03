'use client';

import type React from 'react';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormData } from '@/schemas/login/login-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useLoginMutation } from '@/hooks/auth/use-login-mutation';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { mutateAsync: login, isPending } = useLoginMutation();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const { accessToken, refreshToken } = await login(data);
      signIn(accessToken, refreshToken);
    } catch (e) {
      console.error(e);
      setError('Invalid email or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col gap-6', className)} {...props}>
      <div className='mb-2 flex justify-center'>
        <Image src={'/favicon-96x96-1.png'} alt='Your Logo' width={180} height={60} priority />
      </div>
      <Card className='border-0 shadow-lg'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='font-bold text-2xl'>Welcome Back</CardTitle>
          <CardDescription className='text-muted-foreground'>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className='flex flex-col gap-5'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='your@email.com' className='h-11' {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <Link href='/forgot-password' className='text-primary text-sm hover:underline'>
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Enter your password'
                          className='h-11 pr-10'
                          {...field}
                        />
                        <button
                          type='button'
                          className='-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-gray-700'
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                          <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className='rounded-md bg-red-50 p-3 text-center text-red-500 text-sm'>{error}</div>}
              <Button
                type='submit'
                className='mt-2 h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex justify-center border-t p-6'>
          <p className='text-muted-foreground text-sm'>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='font-medium text-primary hover:underline'>
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
