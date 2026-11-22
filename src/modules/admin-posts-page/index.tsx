'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminPostsQuery, useDeleteAdminPostMutation } from '@/api/admin-posts';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import ConfirmationDialog from '@/components/common/confirmation-dialog';
import { StoreImage } from '@/components/store/store-image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslations } from '@/hooks';
import { Link } from '@/i18n/navigation';
import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/utils';

export default function AdminPostsPage() {
  const { t } = useTranslations('admin');
  const { data: posts = [], isLoading, isError, refetch } = useAdminPostsQuery();
  const { mutate: deletePost } = useDeleteAdminPostMutation();

  const _handleDelete = (id: string) =>
    deletePost(id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: () => toast.error(t('common.deleteError')),
    });

  return (
    <>
      <AdminPageHeader
        title={t('posts.title')}
        subtitle={t('posts.subtitle')}
        action={
          <Button asChild className='rounded-none'>
            <Link href={ROUTES.ADMIN_POST_NEW}>
              <Plus aria-hidden />
              {t('posts.new')}
            </Link>
          </Button>
        }
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={posts.length === 0}
        emptyText={t('posts.empty')}
      >
        <div className='bg-card overflow-x-auto border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('posts.name')}</TableHead>
                <TableHead>{t('posts.status')}</TableHead>
                <TableHead>{t('posts.publishedAt')}</TableHead>
                <TableHead className='text-right'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <span className='bg-muted relative h-12 w-16 shrink-0 overflow-hidden'>
                        <StoreImage src={post.thumbnail_url} alt='' sizes='64px' />
                      </span>
                      <div className='min-w-0'>
                        <p className='max-w-[360px] truncate font-medium'>{post.title}</p>
                        <p className='text-muted-foreground max-w-[360px] truncate text-xs'>/{post.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'border px-2 py-0.5 text-xs',
                        post.published_at
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-300 bg-slate-100 text-slate-600'
                      )}
                    >
                      {post.published_at ? t('posts.published') : t('posts.draft')}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                    {post.published_at ? dayjs(post.published_at).format('DD/MM/YYYY') : '—'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button asChild variant='ghost' size='icon'>
                        <Link
                          href={buildRoute(ROUTES.ADMIN_POST_EDIT, { id: post.id })}
                          aria-label={`${t('common.edit')}: ${post.title}`}
                        >
                          <Pencil aria-hidden />
                        </Link>
                      </Button>
                      <ConfirmationDialog
                        title={t('common.delete')}
                        description={t('common.deleteConfirm', { name: post.title })}
                        confirmText={t('common.delete')}
                        onConfirm={() => _handleDelete(post.id)}
                      >
                        <Button variant='ghost' size='icon' aria-label={`${t('common.delete')}: ${post.title}`}>
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
    </>
  );
}
