import { notFound } from 'next/navigation';

// Unmatched URLs inside a locale render `[locale]/not-found.tsx` (with the translated layout).
export default function CatchAll() {
  notFound();
}
