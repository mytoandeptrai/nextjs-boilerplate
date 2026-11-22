'use client';

import { ExternalLink, FileText, Images, Inbox, LayoutDashboard, LogOut, Package, Settings } from 'lucide-react';

import { useLogoutMutation } from '@/api/admin-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link, usePathname } from '@/i18n/navigation';

const NAV = [
  { href: ROUTES.ADMIN, key: 'dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_QUOTES, key: 'quotes', icon: Inbox },
  { href: ROUTES.ADMIN_PRODUCTS, key: 'products', icon: Package },
  { href: ROUTES.ADMIN_LOOKBOOKS, key: 'lookbooks', icon: Images },
  { href: ROUTES.ADMIN_POSTS, key: 'posts', icon: FileText },
  { href: ROUTES.ADMIN_SETTINGS, key: 'settings', icon: Settings },
] as const;

export function AdminSidebar({ email }: { email: string }) {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogoutMutation();

  const isActive = (href: string) =>
    href === ROUTES.ADMIN ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  // A full reload drops every cached admin response and lets the proxy redirect to the login page.
  const _handleLogout = () => logout(undefined, { onSettled: () => window.location.assign(ROUTES.ADMIN_LOGIN) });

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='px-4 py-5 group-data-[collapsible=icon]:px-2'>
        <p className='truncate text-sm font-medium tracking-[0.2em] uppercase group-data-[collapsible=icon]:hidden'>
          {siteConfig.shortName}
        </p>
        <p className='text-muted-foreground truncate text-xs group-data-[collapsible=icon]:hidden'>
          {t('admin.title')}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={t(`nav.admin.${item.key}`)}>
                  <Link href={item.href}>
                    <item.icon aria-hidden />
                    <span>{t(`nav.admin.${item.key}`)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t('nav.admin.viewStore')}>
              <Link href={ROUTES.HOME} target='_blank'>
                <ExternalLink aria-hidden />
                <span>{t('nav.admin.viewStore')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={_handleLogout} disabled={isPending} tooltip={t('auth.logOut')}>
              <LogOut aria-hidden />
              <span>{t('auth.logOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className='text-muted-foreground truncate px-2 pb-2 text-xs group-data-[collapsible=icon]:hidden'>{email}</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
