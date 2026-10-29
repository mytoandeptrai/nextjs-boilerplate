import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { messages } from '@/messages';
import { LoginForm } from '../components/login-form';

const { loginRequest, replace } = vi.hoisted(() => ({ loginRequest: vi.fn(), replace: vi.fn() }));

vi.mock('@/api/auth/requests', () => ({ loginRequest, logoutRequest: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ replace }),
}));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role='img' aria-label={alt} />,
}));

const renderForm = () =>
  render(
    <NextIntlClientProvider locale='en' messages={messages.en}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
        <LoginForm />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows translated validation errors and does not submit', async () => {
    renderForm();

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'a@b');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    expect(loginRequest).not.toHaveBeenCalled();
  });

  it('logs in and goes home', async () => {
    loginRequest.mockResolvedValue({ authenticated: true });
    renderForm();

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'a@b.co');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(loginRequest.mock.calls[0][0]).toEqual({ email: 'a@b.co', password: 'secret' });
  });

  it('shows a generic error when the credentials are rejected', async () => {
    loginRequest.mockRejectedValue({ status: 401, message: 'bad credentials' });
    renderForm();

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'a@b.co');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
