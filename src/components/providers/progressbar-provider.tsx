'use client';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ProgressBar height='4px' color='#a12d23' options={{ showSpinner: false }} shallowRouting />
    </>
  );
}
