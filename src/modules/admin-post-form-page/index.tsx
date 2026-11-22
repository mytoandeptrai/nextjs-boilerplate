'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type PostBody,
  type PostFormInput,
  postSchema,
  useAdminPostQuery,
  useCreateAdminPostMutation,
  useUpdateAdminPostMutation,
} from '@/api/admin-posts';
import { FieldError } from '@/components/admin/field-error';
import { ImageUpload } from '@/components/admin/image-upload';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import { Markdown } from '@/components/store/markdown';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { HttpStatus } from '@/enums/enum';
import { useTranslations } from '@/hooks';
import { Link, useRouter } from '@/i18n/navigation';
import { slugify } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { IBlogPost } from '@/types/catalog';

function PostForm({ post }: { post?: IBlogPost }) {
  const { t } = useTranslations('admin');
  const router = useRouter();
  const { mutate: create, isPending: isCreating } = useCreateAdminPostMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAdminPostMutation();
  const isPending = isCreating || isUpdating;
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<PostFormInput, unknown, PostBody>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      content_markdown: post?.content_markdown ?? '',
      thumbnail_url: post?.thumbnail_url ?? null,
      is_published: post ? Boolean(post.published_at) : true,
    },
  });
  const slug = useWatch({ control: form.control, name: 'slug' });
  const content = useWatch({ control: form.control, name: 'content_markdown' });

  const _handleSubmit = (body: PostBody) => {
    const options = {
      onSuccess: () => {
        toast.success(t('common.saved'));
        router.push(ROUTES.ADMIN_POSTS);
      },
      onError: (error: { status: number }) => {
        if (error.status === HttpStatus.CONFLICT)
          return form.setError('slug', { type: 'taken' }, { shouldFocus: true });

        toast.error(t('common.saveError'));
      },
    };

    if (post) update({ id: post.id, body }, options);
    else create(body, options);
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(_handleSubmit)} className='grid gap-6 xl:grid-cols-[1fr_360px]'>
        <section className='bg-card min-w-0 space-y-4 border p-4 lg:p-6'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('posts.name')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      if (!post && !form.formState.dirtyFields.slug) form.setValue('slug', slugify(event.target.value));
                    }}
                  />
                </FormControl>
                <FieldError />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('posts.slug')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{t('posts.slugHint', { slug: slug || '...' })}</FormDescription>
                <FieldError messageKey='slugInvalid' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='content_markdown'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between gap-3'>
                  <FormLabel>{t('posts.content')}</FormLabel>
                  <div role='tablist' className='flex border text-xs'>
                    {[false, true].map((preview) => (
                      <button
                        key={String(preview)}
                        type='button'
                        role='tab'
                        aria-selected={isPreview === preview}
                        onClick={() => setIsPreview(preview)}
                        className={cn('px-3 py-1', isPreview === preview && 'bg-foreground text-background')}
                      >
                        {preview ? t('posts.preview') : t('posts.write')}
                      </button>
                    ))}
                  </div>
                </div>
                {isPreview ? (
                  <div className='min-h-[420px] border p-4'>
                    {content.trim() ? (
                      <Markdown content={content} />
                    ) : (
                      <p className='text-muted-foreground text-sm'>{t('posts.previewEmpty')}</p>
                    )}
                  </div>
                ) : (
                  <FormControl>
                    <Textarea rows={18} className='min-h-[420px] font-mono text-sm' {...field} />
                  </FormControl>
                )}
                <FormDescription>{t('posts.contentHint')}</FormDescription>
                <FieldError messageKey='tooLong' />
              </FormItem>
            )}
          />
        </section>

        <div className='space-y-6'>
          <section className='bg-card border p-4 lg:p-6'>
            <FormField
              control={form.control}
              name='thumbnail_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel asChild>
                    <span>{t('posts.thumbnail')}</span>
                  </FormLabel>
                  <ImageUpload
                    folder='posts'
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? null)}
                  />
                </FormItem>
              )}
            />
          </section>
          <section className='bg-card border p-4 lg:p-6'>
            <FormField
              control={form.control}
              name='is_published'
              render={({ field }) => (
                <FormItem className='flex items-start justify-between gap-4'>
                  <div>
                    <FormLabel>{t('posts.isPublished')}</FormLabel>
                    <FormDescription className='mt-1'>{t('posts.isPublishedHint')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
          <div className='flex gap-3'>
            <Button type='submit' size='lg' className='h-11 flex-1 rounded-none' disabled={isPending}>
              {isPending ? <Loader2 className='animate-spin' aria-hidden /> : null}
              {isPending ? t('common.saving') : t('common.save')}
            </Button>
            <Button asChild type='button' variant='outline' size='lg' className='h-11 rounded-none'>
              <Link href={ROUTES.ADMIN_POSTS}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function EditPost({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useAdminPostQuery(id);

  return (
    <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
      {data ? <PostForm post={data} /> : null}
    </QueryState>
  );
}

/** Create (`id` omitted) or edit a guide. */
export default function AdminPostFormPage({ id }: { id?: string }) {
  const { t } = useTranslations('admin');

  return (
    <>
      <div>
        <Link
          href={ROUTES.ADMIN_POSTS}
          className='text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm'
        >
          <ArrowLeft className='size-4' aria-hidden />
          {t('posts.title')}
        </Link>
        <AdminPageHeader title={id ? t('posts.edit') : t('posts.new')} />
      </div>
      {id ? <EditPost id={id} /> : <PostForm />}
    </>
  );
}
