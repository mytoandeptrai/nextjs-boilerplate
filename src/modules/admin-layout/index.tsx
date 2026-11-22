import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/constants/routes';
import { redirect } from '@/i18n/navigation';
import { getAdminUser } from '@/lib/server/admin-session';
import { AdminSidebar } from './admin-sidebar';

/**
 * Shell of the admin portal. The proxy only checks that a session cookie exists; here the token is verified with
 * Supabase and the admin role is required before anything renders.
 */
export default async function AdminLayout({ children, locale }: { children: ReactNode; locale: string }) {
  const admin = await getAdminUser();

  if (!admin) return redirect({ href: ROUTES.ADMIN_LOGIN, locale });

  return (
    <SidebarProvider>
      <AdminSidebar email={admin.email} />
      <SidebarInset className='bg-background min-w-0'>
        <header className='bg-card flex h-14 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <span className='text-muted-foreground truncate text-sm'>{admin.email}</span>
        </header>
        <div className='flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-8'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
