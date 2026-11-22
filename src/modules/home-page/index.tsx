import { Home, Ruler, Wallet } from 'lucide-react';

import { getCategories, getLookbooks, getPosts, getProducts, getZaloHotline } from '@/api/catalog/requests';
import { ProductCard } from '@/components/store/product-card';
import { SectionHeading } from '@/components/store/section-heading';
import { StoreImage } from '@/components/store/store-image';
import { TextLink } from '@/components/store/text-link';
import { Button } from '@/components/ui/button';
import { buildRoute, ROUTES } from '@/constants/routes';
import { useTranslationsServer } from '@/hooks/use-translations-server';
import { Link } from '@/i18n/navigation';
import { buildZaloUrl } from '@/lib/zalo';

export default async function HomePage() {
  const { t } = await useTranslationsServer('store');
  const [categories, products, lookbooks, posts, zaloHotline] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8 }),
    getLookbooks({ limit: 5 }),
    getPosts({ limit: 3 }),
    getZaloHotline(),
  ]);
  const heroImage = lookbooks[0]?.image_url ?? products[0]?.images[0];
  // Full rows only: eight products when there are that many, otherwise one row of four.
  const featured = products.slice(0, products.length >= 8 ? 8 : 4);
  const zaloUrl = buildZaloUrl(zaloHotline);
  const categoryTitle = new Map(categories.map((category) => [category.id, category.title]));
  // A category is shown with the cover of its newest product.
  const categoryCards = categories
    .map((category) => ({
      category,
      image: products.find((product) => product.category_id === category.id)?.images[0],
    }))
    .filter((card) => card.image);
  const steps = [
    { icon: Ruler, title: t('steps.one.title'), text: t('steps.one.text') },
    { icon: Wallet, title: t('steps.two.title'), text: t('steps.two.text') },
    { icon: Home, title: t('steps.three.title'), text: t('steps.three.text') },
  ];

  return (
    <>
      <section className='relative isolate flex min-h-[78dvh] items-end overflow-hidden bg-slate-800 lg:min-h-[86dvh]'>
        {heroImage ? <StoreImage src={heroImage} alt='' sizes='100vw' eager className='-z-20' /> : null}
        <div className='absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-slate-950/10' />
        <div className='container-page pt-40 pb-14 text-white lg:pb-20'>
          <p className='mb-4 text-xs font-medium tracking-[0.3em] text-white/80 uppercase'>{t('hero.eyebrow')}</p>
          <h1 className='max-w-3xl text-4xl leading-[1.15] font-light tracking-tight text-balance sm:text-5xl lg:text-6xl'>
            {t('hero.title')}
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-white/85 lg:text-lg'>{t('hero.subtitle')}</p>
          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <Button asChild size='lg' className='h-12 rounded-none bg-white px-8 text-slate-900 hover:bg-white/90'>
              <Link href={ROUTES.PRODUCTS}>{t('hero.primaryCta')}</Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='h-12 rounded-none border-white/70 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white'
            >
              <Link href={ROUTES.LOOKBOOK}>{t('hero.secondaryCta')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {categoryCards.length > 0 ? (
        <section className='container-page pt-20 lg:pt-28'>
          <SectionHeading eyebrow={t('categories.eyebrow')} title={t('categories.title')} />
          <ul className='mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6'>
            {categoryCards.map(({ category, image }) => (
              <li key={category.id}>
                <Link
                  href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                  className='group bg-muted relative block aspect-[3/4] overflow-hidden'
                >
                  <StoreImage
                    src={image}
                    alt=''
                    sizes='(min-width: 1024px) 25vw, 50vw'
                    className='transition-transform duration-700 ease-out group-hover:scale-105'
                  />
                  <span className='absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent' />
                  <span className='absolute bottom-4 left-4 text-lg font-medium text-white'>{category.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className='container-page pt-20 lg:pt-28'>
        <SectionHeading
          eyebrow={t('featured.eyebrow')}
          title={t('featured.title')}
          action={<TextLink href={ROUTES.PRODUCTS}>{t('featured.viewAll')}</TextLink>}
        />
        {featured.length > 0 ? (
          <ul className='mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6'>
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  categoryTitle={product.category_id ? categoryTitle.get(product.category_id) : undefined}
                  labels={{
                    from: t('product.from'),
                    originalPrice: t('product.originalPrice'),
                    unit: product.pricing_type === 'linear_meter' ? t('product.perMeter') : t('product.perSquareMeter'),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className='border-border text-muted-foreground mt-10 border border-dashed py-16 text-center'>
            {t('product.empty')}
          </p>
        )}
      </section>

      <section className='bg-secondary/70 mt-20 py-20 lg:mt-28 lg:py-24'>
        <div className='container-page'>
          <SectionHeading eyebrow={t('steps.eyebrow')} title={t('steps.title')} />
          <ol className='mt-12 grid gap-10 md:grid-cols-3'>
            {steps.map((step, index) => (
              <li key={step.title} className='border-border border-t pt-6'>
                <div className='flex items-center justify-between'>
                  <step.icon className='text-brand size-7' strokeWidth={1.25} aria-hidden />
                  <span className='text-muted-foreground/50 text-3xl font-light'>0{index + 1}</span>
                </div>
                <h3 className='mt-5 text-lg font-medium'>{step.title}</h3>
                <p className='text-muted-foreground mt-2 text-sm leading-6'>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {lookbooks.length > 0 ? (
        <section className='container-page pt-20 lg:pt-28'>
          <SectionHeading
            eyebrow={t('lookbook.eyebrow')}
            title={t('lookbook.title')}
            subtitle={t('lookbook.subtitle')}
            action={<TextLink href={ROUTES.LOOKBOOK}>{t('lookbook.viewAll')}</TextLink>}
          />
          <ul className='mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
            {lookbooks.slice(0, 5).map((lookbook, index) => (
              <li key={lookbook.id} className={index === 0 ? 'col-span-2 row-span-2' : undefined}>
                <Link
                  href={ROUTES.LOOKBOOK}
                  aria-label={lookbook.title}
                  className='group bg-muted relative block aspect-square h-full overflow-hidden'
                >
                  <StoreImage
                    src={lookbook.image_url}
                    alt={lookbook.title}
                    sizes={index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                    className='transition-transform duration-700 ease-out group-hover:scale-105'
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section className='container-page pt-20 lg:pt-28'>
          <SectionHeading
            eyebrow={t('guides.eyebrow')}
            title={t('guides.title')}
            action={<TextLink href={ROUTES.BLOG}>{t('guides.viewAll')}</TextLink>}
          />
          <ul className='mt-10 grid gap-8 md:grid-cols-3'>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={buildRoute(ROUTES.BLOG_POST, { slug: post.slug })} className='group block'>
                  <div className='bg-muted relative aspect-[3/2] overflow-hidden'>
                    <StoreImage
                      src={post.thumbnail_url}
                      alt=''
                      sizes='(min-width: 768px) 33vw, 100vw'
                      className='transition-transform duration-700 ease-out group-hover:scale-105'
                    />
                  </div>
                  <h3 className='group-hover:text-brand mt-4 text-lg leading-snug font-medium'>{post.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className='container-page pt-20 lg:pt-28'>
        <div className='flex flex-col items-start gap-6 bg-slate-800 px-6 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:py-16'>
          <div className='max-w-xl'>
            <h2 className='text-3xl font-light tracking-tight'>{t('cta.title')}</h2>
            <p className='mt-3 leading-7 text-white/80'>{t('cta.text')}</p>
          </div>
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
            {zaloUrl ? (
              <Button asChild size='lg' className='h-12 rounded-none bg-white px-8 text-slate-900 hover:bg-white/90'>
                <a href={zaloUrl} target='_blank' rel='noopener noreferrer'>
                  {t('cta.zalo')}
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              size='lg'
              variant='outline'
              className='h-12 rounded-none border-white/70 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white'
            >
              <Link href={ROUTES.PRODUCTS}>{t('cta.browse')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
