import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getPostBySlug } from '@/api/catalog/requests';
import { JsonLd } from '@/components/seo/json-ld';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { toLocale } from '@/i18n/routing';
import { getExcerpt } from '@/lib/markdown';
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, getAbsoluteUrl } from '@/lib/seo';
import BlogPostPage from '@/modules/blog-post-page';
import type { PageProps } from '@/types/type';

type Props = PageProps<{ locale: string; slug: string }>;

export const revalidate = 60;

const getPost = cache(getPostBySlug);

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  return buildMetadata({
    locale: toLocale(locale),
    path: buildRoute(ROUTES.BLOG_POST, { slug }),
    title: post.title,
    description: getExcerpt(post.content_markdown) || undefined,
    image: post.thumbnail_url ? { url: post.thumbnail_url, alt: post.title } : undefined,
    article: { publishedTime: post.published_at || undefined },
  });
}

export default async function Page({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const locale = toLocale(rawLocale);
  const { t } = await useTranslationsServer('common.seo', locale);
  const url = getAbsoluteUrl(locale, buildRoute(ROUTES.BLOG_POST, { slug }));

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          url,
          locale,
          headline: post.title,
          description: getExcerpt(post.content_markdown),
          image: post.thumbnail_url,
          datePublished: post.published_at,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('home'), url: getAbsoluteUrl(locale) },
          { name: t('blog'), url: getAbsoluteUrl(locale, ROUTES.BLOG) },
          { name: post.title, url },
        ])}
      />
      <BlogPostPage post={post} />
    </>
  );
}
