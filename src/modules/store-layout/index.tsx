import type { ReactNode } from 'react';

import { getZaloHotline } from '@/api/catalog/requests';
import { CartDrawer } from '@/components/store/cart-drawer';
import { ChatWidget } from '@/components/store/chat-widget';
import { StoreProvider } from '@/components/store/store-provider';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

/** Shell of every public page: header, cart drawer, footer and the chat assistant (which shows itself when the server has a Gemini key). The Zalo hotline comes from the admin settings. */
export default async function StoreLayout({ children }: { children: ReactNode }) {
  const zaloHotline = await getZaloHotline();

  return (
    <StoreProvider zaloHotline={zaloHotline}>
      <div className='flex min-h-dvh flex-col'>
        <SiteHeader />
        <main className='flex-1'>{children}</main>
        <SiteFooter zaloHotline={zaloHotline} />
      </div>
      <CartDrawer />
      <ChatWidget />
    </StoreProvider>
  );
}
