import AdminProductFormPage from '@/modules/admin-product-form-page';
import type { PageProps } from '@/types/type';

export default async function Page({ params }: PageProps<{ locale: string; id: string }>) {
  const { id } = await params;

  return <AdminProductFormPage id={id} />;
}
