'use client';
import * as React from 'react';

import { NavMain } from '@/components/shared';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { useNavData } from '@/hooks/use-nav-data';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const navData = useNavData();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='flex items-center justify-center'>
        {state === 'collapsed' ? (
          <Image src='/next.svg' alt='Your Logo' width={50} height={50} />
        ) : (
          <Image src='/next.svg' alt='Your Logo' width={200} height={70} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData} />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
