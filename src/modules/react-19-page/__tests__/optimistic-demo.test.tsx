import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';

import { messages } from '@/messages';
import { OptimisticDemo } from '../components/optimistic-demo';

const { addNoteAction, toastError } = vi.hoisted(() => ({ addNoteAction: vi.fn(), toastError: vi.fn() }));

vi.mock('../actions', () => ({ addNoteAction }));
vi.mock('sonner', () => ({ toast: { error: toastError } }));

const renderDemo = () =>
  render(
    <NextIntlClientProvider locale='en' messages={messages.en}>
      <OptimisticDemo />
    </NextIntlClientProvider>
  );

describe('OptimisticDemo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the note immediately, then keeps it once the server confirms', async () => {
    let resolve!: (note: { id: string; text: string }) => void;
    addNoteAction.mockReturnValue(new Promise((done) => (resolve = done)));
    renderDemo();

    await userEvent.type(screen.getByLabelText('Note'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));

    expect(await screen.findByText('hello')).toBeInTheDocument();
    expect(screen.getByText('saving...')).toBeInTheDocument();

    resolve({ id: '1', text: 'hello' });

    await waitFor(() => expect(screen.queryByText('saving...')).not.toBeInTheDocument());
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('rolls the note back and reports the error when the server rejects it', async () => {
    addNoteAction.mockRejectedValue(new Error('rejected'));
    renderDemo();

    await userEvent.type(screen.getByLabelText('Note'), 'fail');
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('The server rejected the note.'));
    expect(screen.queryByText('fail')).not.toBeInTheDocument();
  });
});
