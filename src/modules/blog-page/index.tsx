import { getPosts } from '@/api/catalog/requests';
import { SectionHeading } from '@/components/store/section-heading';
import { StoreImage } from '@/components/store/store-image';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';
import dayjs from '@/lib/dayjs';
import { getExcerpt } from '@/lib/markdown';

export default async function BlogPage() {
  const { t } = await useTranslationsServer('store.guides');
  const posts = await getPosts();

  return (
    <div className='container-page pt-12 lg:pt-16'>
      <SectionHeading as='h1' eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
      {posts.length > 0 ? (
        <ul className='mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link href={buildRoute(ROUTES.BLOG_POST, { slug: post.slug })} className='group block'>
                <div className='bg-muted relative aspect-[3/2] overflow-hidden'>
                  <StoreImage
                    src={post.thumbnail_url}
                    alt=''
                    sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                    eager={index === 0}
                    className='transition-transform duration-700 ease-out group-hover:scale-105'
                  />
                </div>
                {post.published_at ? (
                  <time dateTime={post.published_at} className='text-muted-foreground mt-4 block text-xs'>
                    {dayjs(post.published_at).format('DD/MM/YYYY')}
                  </time>
                ) : null}
                <h2 className='group-hover:text-brand mt-2 text-xl leading-snug font-medium'>{post.title}</h2>
                <p className='text-muted-foreground mt-2 text-sm leading-6'>{getExcerpt(post.content_markdown)}</p>
                <span className='border-foreground mt-3 inline-block border-b pb-0.5 text-sm'>{t('readMore')}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className='border-border text-muted-foreground mt-10 border border-dashed py-20 text-center'>{t('empty')}</p>
      )}
    </div>
  );
}
