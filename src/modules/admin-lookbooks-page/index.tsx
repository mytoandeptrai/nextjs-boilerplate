'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAdminLookbooksQuery, useDeleteAdminLookbookMutation } from '@/api/admin-lookbooks';
import { useAdminProductsQuery } from '@/api/admin-products';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import ConfirmationDialog from '@/components/common/confirmation-dialog';
import { StoreImage } from '@/components/store/store-image';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks';
import type { ILookbook } from '@/types/catalog';
import { LookbookDialog } from './lookbook-dialog';

export default function AdminLookbooksPage() {
  const { t } = useTranslations('admin');
  const { data: lookbooks = [], isLoading, isError, refetch } = useAdminLookbooksQuery();
  const { data: products = [] } = useAdminProductsQuery();
  const { mutate: deleteLookbook } = useDeleteAdminLookbookMutation();
  // `undefined` = closed, `null` = new photo.
  const [editing, setEditing] = useState<ILookbook | null | undefined>();

  const _handleDelete = (id: string) =>
    deleteLookbook(id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: () => toast.error(t('common.deleteError')),
    });

  return (
    <>
      <AdminPageHeader
        title={t('lookbooks.title')}
        subtitle={t('lookbooks.subtitle')}
        action={
          <Button className='rounded-none' onClick={() => setEditing(null)}>
            <Plus aria-hidden />
            {t('lookbooks.new')}
          </Button>
        }
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={lookbooks.length === 0}
        emptyText={t('lookbooks.empty')}
      >
        <ul className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'>
          {lookbooks.map((lookbook) => (
            <li key={lookbook.id} className='bg-card border'>
              <div className='bg-muted relative aspect-[4/3]'>
                <StoreImage src={lookbook.image_url} alt={lookbook.title} sizes='(min-width: 1280px) 25vw, 50vw' />
              </div>
              <div className='flex items-start justify-between gap-2 p-3'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{lookbook.title}</p>
                  <p className='text-muted-foreground text-xs'>
                    {t('lookbooks.tagged', { count: lookbook.tagged_product_ids.length })}
                  </p>
                </div>
                <div className='flex shrink-0'>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label={`${t('common.edit')}: ${lookbook.title}`}
                    onClick={() => setEditing(lookbook)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                  <ConfirmationDialog
                    title={t('common.delete')}
                    description={t('common.deleteConfirm', { name: lookbook.title })}
                    confirmText={t('common.delete')}
                    onConfirm={() => _handleDelete(lookbook.id)}
                  >
                    <Button variant='ghost' size='icon' aria-label={`${t('common.delete')}: ${lookbook.title}`}>
                      <Trash2 aria-hidden />
                    </Button>
                  </ConfirmationDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </QueryState>

      {editing === undefined ? null : (
        <LookbookDialog
          key={editing?.id ?? 'new'}
          lookbook={editing}
          products={products}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
