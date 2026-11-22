import StoreLayout from '@/modules/store-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StoreLayout>{children}</StoreLayout>;
}
