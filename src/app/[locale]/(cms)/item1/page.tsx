import { Suspense } from 'react';

import Item1Page from '@/modules/item1-page';

export default function Page() {
  return (
    <Suspense>
      <Item1Page />
    </Suspense>
  );
}
