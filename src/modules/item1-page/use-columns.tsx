'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDelete } from '@/components/ui/notification-delete';
import { type IItem1, useDeleteItem1Mutation } from '@/api/item1';
import type { Translator } from '@/types/translation';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Flag, MoreHorizontal, Trash } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useMemo, useState } from 'react';

export function useColumns(t: Translator): ColumnDef<IItem1>[] {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({
    isOpen: false,
    itemId: null,
    itemName: null,
  });

  const handleDelete = useCallback(
    (itemId: string, itemName: string) => () => {
      setDeleteDialogState({ isOpen: true, itemId, itemName });
    },
    []
  );
  const { mutate: deleteItem } = useDeleteItem1Mutation();

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogState({
      isOpen: false,
      itemId: null,
      itemName: null,
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteDialogState.itemId) {
      deleteItem(deleteDialogState.itemId, {
        onSuccess: handleCancelDelete,
      });
    }
  }, [deleteDialogState.itemId, deleteItem, handleCancelDelete]);

  const handleEdit = useCallback(
    (itemId: string) => () => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('action', 'edit');
      newSearchParams.set('id', itemId);
      router.push(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return useMemo(() => {
    return [
      {
        accessorKey: 'name',
        header: t('item.name'),
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <span>{row.original.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('item.createdAt'),
        cell: ({ row }) => {
          return new Date(row.original.createdAt).toLocaleDateString();
        },
      },
      {
        accessorKey: 'updatedAt',
        header: t('item.updatedAt'),
        cell: ({ row }) => {
          return new Date(row.original.updatedAt).toLocaleDateString();
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className={`h-8 w-8 p-0 ${row.getIsSelected() ? 'bg-brand-10 rounded-full' : ''}`}
                  >
                    <span className='sr-only'>{t('item.openMenu')}</span>
                    <MoreHorizontal
                      className={`hover:bg-brand-10 h-4 w-4 hover:rounded-full ${
                        row.getIsSelected() ? 'text-brand-60' : ''
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem asChild>
                    <Button
                      variant='destructive'
                      className='w-full justify-start'
                      onClick={handleDelete(row.original.id, row.original.name || t('item.unknown'))}
                    >
                      <Trash className='mr-2 h-4 w-4' />
                      {t('common.delete')}
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit(row.original.id)}>
                    <Edit className='mr-2 h-4 w-4' />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit(row.original.id)}>
                    <Flag className='mr-2 h-4 w-4' />
                    {t('common.report')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NotificationDelete
                isOpen={deleteDialogState.isOpen}
                onOpenChange={(open) => setDeleteDialogState({ ...deleteDialogState, isOpen: open })}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                itemName={deleteDialogState.itemName || t('item.unknown')}
              />
            </>
          );
        },
      },
    ];
  }, [t, handleEdit, handleDelete, deleteDialogState, handleConfirmDelete, handleCancelDelete]);
}
