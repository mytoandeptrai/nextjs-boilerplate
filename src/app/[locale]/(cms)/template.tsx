import { HeaderLocaleSwitcher, AppSidebar, NavUser } from '@/components/shared';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
          </div>
          <div className='flex items-center gap-2'>
            <HeaderLocaleSwitcher />
            <NavUser
              user={{
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar: 'https://github.com/shadcn.png',
              }}
            />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
