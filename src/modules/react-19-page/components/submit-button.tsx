'use client';

import { Loader } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: ReactNode;
}

/**
 * `useFormStatus` reads the status of the PARENT `<form>` without props: it must be rendered inside the form,
 * in its own component, which is why the button is not inlined in the form components.
 */
export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type='submit' disabled={pending}>
      {pending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
