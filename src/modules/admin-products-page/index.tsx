'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAdminProductsQuery, useDeleteAdminProductMutation } from '@/api/admin-products';
import { useCategoriesQuery } from '@/api/catalog/queries';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import ConfirmationDialog from '@/components/common/confirmation-dialog';
import { StoreImage } from '@/components/store/store-image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/format';
import { getTotalPages } from '@/lib/pagination';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const { t } = useTranslations('admin');
  const { data: products = [], isLoading, isError, refetch } = useAdminProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { mutate: deleteProduct } = useDeleteAdminProductMutation();
  const categoryTitle = new Map(categories.map((category) => [category.id, category.title]));
  const [requestedPage, setPage] = useState(1);
  const totalPages = getTotalPages(products.length, PAGE_SIZE);
  // Deleting the last product of the last page steps back instead of showing an empty table.
  const page = Math.min(requestedPage, totalPages);
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const _handleDelete = (id: string) =>
    deleteProduct(id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: () => toast.error(t('common.deleteError')),
    });

  return (
    <>
      <AdminPageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        action={
          <Button asChild className='rounded-none'>
            <Link href={ROUTES.ADMIN_PRODUCT_NEW}>
              <Plus aria-hidden />
              {t('products.new')}
            </Link>
          </Button>
        }
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={products.length === 0}
        emptyText={t('products.empty')}
      >
        <div className='bg-card overflow-x-auto border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.product')}</TableHead>
                <TableHead>{t('products.category')}</TableHead>
                <TableHead>{t('products.pricing')}</TableHead>
                <TableHead className='text-right'>{t('products.price')}</TableHead>
                <TableHead>{t('products.status')}</TableHead>
                <TableHead className='text-right'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <span className='bg-muted relative size-12 shrink-0 overflow-hidden'>
                        <StoreImage src={product.images[0]} alt='' sizes='48px' />
                      </span>
                      <div className='min-w-0'>
                        <p className='max-w-[260px] truncate font-medium'>{product.title}</p>
                        <p className='text-muted-foreground max-w-[260px] truncate text-xs'>/{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{(product.category_id && categoryTitle.get(product.category_id)) || '—'}</TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {product.pricing_type === 'linear_meter' ? t('products.linearMeter') : t('products.squareMeter')}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>{formatVnd(product.base_price)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'border px-2 py-0.5 text-xs',
                        product.is_active
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-300 bg-slate-100 text-slate-600'
                      )}
                    >
                      {product.is_active ? t('products.active') : t('products.inactive')}
                    </span>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button asChild variant='ghost' size='icon'>
                        <Link
                          href={buildRoute(ROUTES.ADMIN_PRODUCT_EDIT, { id: product.id })}
                          aria-label={`${t('common.edit')}: ${product.title}`}
                        >
                          <Pencil aria-hidden />
                        </Link>
                      </Button>
                      <ConfirmationDialog
                        title={t('common.delete')}
                        description={t('common.deleteConfirm', { name: product.title })}
                        confirmText={t('common.delete')}
                        onConfirm={() => _handleDelete(product.id)}
                      >
                        <Button variant='ghost' size='icon' aria-label={`${t('common.delete')}: ${product.title}`}>
                          <Trash2 aria-hidden />
                        </Button>
                      </ConfirmationDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 ? (
          <div className='mt-4 flex items-center justify-end gap-3 text-sm'>
            <span className='text-muted-foreground'>{t('common.page', { page, total: totalPages })}</span>
            <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('common.previous')}
            </Button>
            <Button variant='outline' size='sm' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {t('common.next')}
            </Button>
          </div>
        ) : null}
      </QueryState>
    </>
  );
}
