import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getPostBySlug } from '@/api/catalog/requests';
import { buildRoute, ROUTES } from '@/constants/routes';
import { toLocale } from '@/i18n/routing';
import { getExcerpt } from '@/lib/markdown';
import { buildMetadata } from '@/lib/seo';
import BlogPostPage from '@/modules/blog-post-page';
import type { PageProps } from '@/types/type';

type Props = PageProps<{ locale: string; slug: string }>;

export const revalidate = 60;

const getPost = cache(getPostBySlug);

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const metadata = await buildMetadata({
    locale: toLocale(locale),
    path: buildRoute(ROUTES.BLOG_POST, { slug }),
    title: post.title,
    description: getExcerpt(post.content_markdown) || undefined,
  });

  return post.thumbnail_url
    ? { ...metadata, openGraph: { ...metadata.openGraph, images: [post.thumbnail_url] } }
    : metadata;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <BlogPostPage post={post} />;
}
