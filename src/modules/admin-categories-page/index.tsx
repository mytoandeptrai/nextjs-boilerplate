'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAdminCategoriesQuery, useDeleteAdminCategoryMutation } from '@/api/admin-categories';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import ConfirmationDialog from '@/components/common/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslations } from '@/hooks';
import type { IAdminCategory } from '@/types/catalog';
import { CategoryDialog } from './category-dialog';

export default function AdminCategoriesPage() {
  const { t } = useTranslations('admin');
  const { data: categories = [], isLoading, isError, refetch } = useAdminCategoriesQuery();
  const { mutate: deleteCategory } = useDeleteAdminCategoryMutation();
  // `undefined` = closed, `null` = new category.
  const [editing, setEditing] = useState<IAdminCategory | null | undefined>();
  const nextOrder = Math.max(0, ...categories.map((category) => category.display_order)) + 1;

  const _handleDelete = (id: string) =>
    deleteCategory(id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: () => toast.error(t('common.deleteError')),
    });

  return (
    <>
      <AdminPageHeader
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        action={
          <Button className='rounded-none' onClick={() => setEditing(null)}>
            <Plus aria-hidden />
            {t('categories.new')}
          </Button>
        }
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={categories.length === 0}
        emptyText={t('categories.empty')}
      >
        <div className='bg-card overflow-x-auto border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>{t('categories.order')}</TableHead>
                <TableHead>{t('categories.name')}</TableHead>
                <TableHead>{t('categories.slug')}</TableHead>
                <TableHead className='text-right'>{t('categories.products')}</TableHead>
                <TableHead className='text-right'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} data-testid='category-row'>
                  <TableCell className='tabular-nums'>{category.display_order}</TableCell>
                  <TableCell className='font-medium'>{category.title}</TableCell>
                  <TableCell className='text-muted-foreground'>{category.slug}</TableCell>
                  <TableCell className='text-right tabular-nums'>{category.product_count}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        aria-label={`${t('common.edit')}: ${category.title}`}
                        onClick={() => setEditing(category)}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      <ConfirmationDialog
                        title={t('common.delete')}
                        description={t('categories.deleteConfirm', {
                          name: category.title,
                          count: category.product_count,
                        })}
                        confirmText={t('common.delete')}
                        onConfirm={() => _handleDelete(category.id)}
                      >
                        <Button variant='ghost' size='icon' aria-label={`${t('common.delete')}: ${category.title}`}>
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
      </QueryState>

      {editing === undefined ? null : (
        <CategoryDialog
          key={editing?.id ?? 'new'}
          category={editing}
          nextOrder={nextOrder}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
