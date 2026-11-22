import { ArrowLeft } from 'lucide-react';

import { Markdown } from '@/components/store/markdown';
import { StoreImage } from '@/components/store/store-image';
import { ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';
import dayjs from '@/lib/dayjs';
import type { IBlogPost } from '@/types/catalog';

export default async function BlogPostPage({ post }: { post: IBlogPost }) {
  const { t } = await useTranslationsServer('store.guides');

  return (
    <article className='container-page pt-8 lg:pt-12'>
      <div className='mx-auto max-w-3xl'>
        <Link
          href={ROUTES.BLOG}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm'
        >
          <ArrowLeft className='size-4' aria-hidden />
          {t('back')}
        </Link>
        <h1 className='mt-6 text-3xl leading-tight font-light tracking-tight text-balance lg:text-5xl'>{post.title}</h1>
        {post.published_at ? (
          <time dateTime={post.published_at} className='text-muted-foreground mt-4 block text-sm'>
            {dayjs(post.published_at).format('DD/MM/YYYY')}
          </time>
        ) : null}
      </div>
      {post.thumbnail_url ? (
        <div className='bg-muted relative mx-auto mt-8 aspect-[16/9] max-w-5xl overflow-hidden'>
          <StoreImage src={post.thumbnail_url} alt={post.title} sizes='(min-width: 1024px) 1024px, 100vw' eager />
        </div>
      ) : null}
      <Markdown content={post.content_markdown} className='mx-auto mt-10 max-w-3xl' />
    </article>
  );
}
